import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { calculateLFD } from "@/lib/lfd-calculator";

// Helper to resolve firm ID
async function resolveFirmId(supabase: any, { firmId, firmName, ownerPhone, userId }: any) {
  if (firmId) return firmId;

  // 1. Try finding by firm_name
  if (firmName) {
    const { data: existing } = await supabase
      .from("firms")
      .select("id")
      .ilike("firm_name", firmName.trim())
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;
  }

  // 2. Try finding by owner_phone
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

  // 3. Try finding by auth_user_id
  if (userId) {
    const { data: existingByUser } = await supabase
      .from("firms")
      .select("id")
      .eq("auth_user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existingByUser?.id) return existingByUser.id;
  }

  // 4. Create firm if not found
  const { data: newFirm } = await supabase
    .from("firms")
    .insert([{
      firm_name: firmName || "My Freight Agency",
      owner_name: "Operations Admin",
      owner_phone: ownerPhone || "+919876543210",
      plan_type: "trial",
      containers_limit: 50,
      is_active: true,
      ...(userId ? { auth_user_id: userId } : {})
    }])
    .select("id")
    .single();

  return newFirm?.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const containers = body.containers;
    const firmId = body.firmId || body.firm_id;
    const firmName = body.firmName || body.firm_name;
    const ownerPhone = body.ownerPhone || body.owner_phone || body.phone;
    const userId = body.userId || body.user_id;

    if (!containers || !Array.isArray(containers) || containers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No container records supplied." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Resolve exact firm ID
    const resolvedFirmId = await resolveFirmId(supabase, {
      firmId,
      firmName,
      ownerPhone,
      userId,
    });

    const rows = containers.map((c: any) => {
      const containerNo = (c.container_number || c.container || c.containerNo || "").toUpperCase();
      const dischargeDate = c.discharge_date || new Date().toISOString().split("T")[0];
      const freeDays = Number(c.demurrage_free_days) || 14;
      const lfdDate = calculateLFD(dischargeDate, freeDays);

      return {
        firm_id: resolvedFirmId,
        container_number: containerNo,
        shipping_line: c.shipping_line || c.line || "Maersk",
        shipping_line_code: c.shipping_line_code || c.line_code || (containerNo || "GEN").substring(0, 4),
        container_type: c.container_type || c.type || "40ft",
        port: c.port || "Kandla",
        vessel_name: c.vessel_name || c.vessel || "Cargo Vessel",
        importer_name: c.importer_name || c.importer || "Direct Importer",
        importer_phone: c.importer_phone || c.phone || ownerPhone || "+919876543210",
        discharge_date: dischargeDate,
        demurrage_free_days: freeDays,
        demurrage_lfd: c.demurrage_lfd || c.last_free_day_demurrage || lfdDate,
        bl_number: c.bl_number || c.booking_number || c.blNumber || null,
        status: c.status || "active",
      };
    });

    const { data: inserted, error: insertError } = await supabase
      .from("containers")
      .insert(rows)
      .select();

    if (insertError) {
      console.error("[Bulk Confirm Import DB Error]:", insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      insertedCount: rows.length,
      containers: inserted,
    });
  } catch (error: any) {
    console.error("Bulk confirm import database error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed bulk importing containers.",
        details: error
      },
      { status: 500 }
    );
  }
}
