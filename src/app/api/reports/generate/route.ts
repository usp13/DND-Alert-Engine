import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getRemainingFreeDays } from "@/lib/lfd-calculator";
import { format, parseISO, isValid } from "date-fns";

// Helper to resolve firm ID
async function resolveFirmId(supabase: any, { firmId, firmName, ownerPhone, userId }: any) {
  if (firmId) return firmId;

  if (firmName) {
    const { data: existing } = await supabase
      .from("firms")
      .select("id")
      .ilike("firm_name", firmName.trim())
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;
  }

  if (ownerPhone) {
    const cleanPhone = ownerPhone.replace(/[^0-9]/g, "").slice(-10);
    const { data: existingByPhone } = await supabase
      .from("firms")
      .select("id")
      .ilike("owner_phone", `%${cleanPhone}%`)
      .limit(1)
      .maybeSingle();

    if (existingByPhone?.id) return existingByPhone.id;
  }

  if (userId) {
    const { data: existingByUser } = await supabase
      .from("firms")
      .select("id")
      .eq("auth_user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existingByUser?.id) return existingByUser.id;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firmId = searchParams.get("firmId") || searchParams.get("firm_id");
    const userEmail = searchParams.get("user_email") || request.headers.get("x-user-email");
    const firmName = searchParams.get("firmName") || searchParams.get("firm_name");
    const ownerPhone = searchParams.get("phone") || searchParams.get("owner_phone");

    const supabase = createServerSupabaseClient();
    
    let allContainers: any[] = [];
    let allAlerts: any[] = [];

    const resolvedFirmId = await resolveFirmId(supabase, {
      firmId,
      firmName,
      ownerPhone,
    });

    if (resolvedFirmId) {
      const { data: firmContainers, error: cErr } = await supabase
        .from("containers")
        .select("*")
        .eq("firm_id", resolvedFirmId)
        .order("created_at", { ascending: false });

      if (!cErr && firmContainers) {
        allContainers = firmContainers;
      }

      const { data: firmAlerts } = await supabase
        .from("alerts")
        .select("*")
        .eq("firm_id", resolvedFirmId);
      
      allAlerts = firmAlerts || [];
    } else if (userEmail) {
      allContainers = [];
    } else {
      const { data: globalContainers } = await supabase
        .from("containers")
        .select("*")
        .order("created_at", { ascending: false });
      allContainers = globalContainers || [];
    }

    // If user has 0 containers, return empty report structure
    if (allContainers.length === 0) {
      return NextResponse.json({
        success: true,
        report: {
          totalContainers: 0,
          totalSavings: 0,
          totalActualCost: 0,
          containersWithDD: 0,
          containersSafe: 0,
          alertsCount: 0,
          timelineData: [],
          carrierBreakdown: [],
          turnaroundDistribution: [],
          recentLedger: [],
        },
      });
    }

    const totalContainers = allContainers.length;

    // Evaluate each container dynamically
    let totalActualCost = 0;
    let totalSavings = 0;
    let containersWithDD = 0;
    let containersSafe = 0;

    // Timeline map: YYYY-MM -> { month, saved, incurred, containers }
    const timelineMap: Record<string, { month: string; saved: number; incurred: number; containers: number }> = {};

    // Carrier map: lineName -> { line, saved, incurred, boxes, freeDaysSum, count }
    const carrierMap: Record<string, { line: string; saved: number; incurred: number; boxes: number; totalFreeDays: number }> = {};

    // Turnaround buckets
    let earlyClearCount = 0;
    let withinFreeCount = 0;
    let lfdDayCount = 0;
    let overdueCount = 0;

    for (const c of allContainers) {
      const remainingDays = getRemainingFreeDays(c.demurrage_lfd);
      const isOverdue = remainingDays < 0;
      const isLfdDay = remainingDays === 0;
      const isReturned = !!c.empty_return_date || c.status === "cleared";
      const freeDays = Number(c.demurrage_free_days) || 14;

      // Demurrage charges
      const penaltyCost = Number(c.total_dd_charges || c.demurrage_charges || 0);

      // Estimated avoided demurrage if cleared without overdue penalties:
      // Base estimated penalty avoided per container = free_days * slab1 average (approx INR 1,800/day)
      const avoidedCost = freeDays * 1800;

      if (isOverdue || penaltyCost > 0) {
        containersWithDD++;
        overdueCount++;
        totalActualCost += penaltyCost > 0 ? penaltyCost : Math.abs(remainingDays) * 2000;
      } else {
        containersSafe++;
        totalSavings += avoidedCost;

        if (isReturned || remainingDays > 7) {
          earlyClearCount++;
        } else if (isLfdDay) {
          lfdDayCount++;
        } else {
          withinFreeCount++;
        }
      }

      // Group into monthly timeline
      const dateStr = c.discharge_date || c.created_at;
      let monthKey = "Recent";
      if (dateStr) {
        const parsed = parseISO(dateStr);
        if (isValid(parsed)) {
          monthKey = format(parsed, "MMM yyyy");
        }
      }

      if (!timelineMap[monthKey]) {
        timelineMap[monthKey] = { month: monthKey, saved: 0, incurred: 0, containers: 0 };
      }
      timelineMap[monthKey].containers += 1;
      if (isOverdue || penaltyCost > 0) {
        timelineMap[monthKey].incurred += penaltyCost > 0 ? penaltyCost : Math.abs(remainingDays) * 2000;
      } else {
        timelineMap[monthKey].saved += avoidedCost;
      }

      // Group into carrier map
      const lineName = c.shipping_line || "Other Line";
      if (!carrierMap[lineName]) {
        carrierMap[lineName] = { line: lineName, saved: 0, incurred: 0, boxes: 0, totalFreeDays: 0 };
      }
      carrierMap[lineName].boxes += 1;
      carrierMap[lineName].totalFreeDays += freeDays;
      if (isOverdue || penaltyCost > 0) {
        carrierMap[lineName].incurred += penaltyCost > 0 ? penaltyCost : Math.abs(remainingDays) * 2000;
      } else {
        carrierMap[lineName].saved += avoidedCost;
      }
    }

    const timelineData = Object.values(timelineMap);
    const carrierBreakdown = Object.values(carrierMap).map((item) => ({
      line: item.line,
      boxes: item.boxes,
      freeDays: Math.round(item.totalFreeDays / Math.max(1, item.boxes)),
      incurred: item.incurred,
      saved: item.saved,
    }));

    // Turnaround percentage distribution
    const safeTotal = Math.max(1, totalContainers);
    const turnaroundDistribution = [
      { name: "Early Clear (< 7 Days)", value: Math.round((earlyClearCount / safeTotal) * 100), count: earlyClearCount, color: "#10b981" },
      { name: "Within Free Time (8-14 Days)", value: Math.round((withinFreeCount / safeTotal) * 100), count: withinFreeCount, color: "#38bdf8" },
      { name: "Saved on LFD Day", value: Math.round((lfdDayCount / safeTotal) * 100), count: lfdDayCount, color: "#f59e0b" },
      { name: "Overdue Slabs Incurred", value: Math.round((overdueCount / safeTotal) * 100), count: overdueCount, color: "#f43f5e" },
    ];

    // Recent container records from database for audit ledger
    const recentLedger = allContainers.slice(0, 10).map((c) => {
      const remDays = getRemainingFreeDays(c.demurrage_lfd);
      const isOver = remDays < 0;
      return {
        id: c.id,
        containerNo: c.container_number,
        shippingLine: c.shipping_line,
        port: c.port || "Kandla",
        dischargeDate: c.discharge_date,
        lfd: c.demurrage_lfd,
        freeDays: c.demurrage_free_days || 14,
        status: isOver ? "Overdue" : c.status === "cleared" ? "Returned" : "Protected (Free Time)",
        avoidedSavings: isOver ? 0 : (c.demurrage_free_days || 14) * 1800,
        incurredPenalty: isOver ? Number(c.total_dd_charges || Math.abs(remDays) * 2000) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      report: {
        totalContainers,
        containersSafe,
        containersWithDD,
        totalSavings,
        totalActualCost,
        alertsCount: allAlerts.length,
        timelineData,
        carrierBreakdown,
        turnaroundDistribution,
        recentLedger,
      },
    });
  } catch (error: any) {
    console.error("Reports API failure:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed generating report statistics." },
      { status: 500 }
    );
  }
}
