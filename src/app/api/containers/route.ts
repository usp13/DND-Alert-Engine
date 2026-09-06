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

  // 4. If no firm found, create one
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

// GET active containers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firmIdParam = searchParams.get("firm_id") || searchParams.get("firmId");
    const firmNameParam = searchParams.get("firm_name") || searchParams.get("firmName");
    const userEmail = searchParams.get("user_email") || request.headers.get("x-user-email");
    const phoneParam = searchParams.get("phone");

    const supabase = createServerSupabaseClient();
    
    // Resolve firm
    let targetFirmId: string | null = null;
    if (firmIdParam) {
      targetFirmId = firmIdParam;
    } else if (firmNameParam || phoneParam) {
      targetFirmId = await resolveFirmId(supabase, {
        firmName: firmNameParam,
        ownerPhone: phoneParam,
      });
    }

    if (targetFirmId) {
      const { data: containers, error } = await supabase
        .from("containers")
        .select("*")
        .eq("firm_id", targetFirmId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[API Containers GET Error by firm]:", error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        containers: containers || [],
      });
    }

    // If userEmail is provided but firmId is not resolved yet, return empty list for isolated user
    if (userEmail) {
      return NextResponse.json({
        success: true,
        containers: [],
      });
    }

    const { data: containers, error } = await supabase
      .from("containers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API Containers GET Error]:", error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      containers: containers || [],
    });
  } catch (error: any) {
    console.error("[API Containers GET Exception]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || error.details || "Failed fetching records.",
        details: error
      },
      { status: 500 }
    );
  }
}

// POST create container
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    const firmId = await resolveFirmId(supabase, {
      firmId: body.firm_id,
      firmName: body.firm_name || body.chaFirm || body.firmName,
      ownerPhone: body.owner_phone || body.phone,
      userId: body.user_id,
    });

    const containerNo = (body.container_number || body.container || body.containerNo || "").toUpperCase();
    const dischargeDate = body.discharge_date || new Date().toISOString().split("T")[0];
    const freeDays = Number(body.demurrage_free_days) || 14;
    const lfdDate = calculateLFD(dischargeDate, freeDays);

    const payload: any = {
      firm_id: firmId,
      container_number: containerNo,
      shipping_line: body.shipping_line || body.line || "Maersk",
      shipping_line_code: body.shipping_line_code || body.line_code || (containerNo || "GEN").substring(0, 4),
      container_type: body.container_type || body.type || "40ft",
      port: body.port || "Kandla",
      vessel_name: body.vessel_name || body.vessel || "Cargo Vessel",
      importer_name: body.importer_name || body.importer || "Direct Importer",
      importer_phone: body.importer_phone || body.phone || "+919876543210",
      discharge_date: dischargeDate,
      demurrage_free_days: freeDays,
      demurrage_lfd: body.demurrage_lfd || body.last_free_day_demurrage || body.lfd || lfdDate,
      bl_number: body.bl_number || body.booking_number || body.blNumber || null,
      status: body.status || "active",
      ...(body.notes ? { notes: body.notes } : {}),
    };

    const { data: insertedContainer, error } = await supabase
      .from("containers")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[API Containers POST Error]:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      container: insertedContainer,
    });
  } catch (error: any) {
    console.error("[API Containers POST Exception]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || error.details || "Failed inserting container.",
        details: error
      },
      { status: 500 }
    );
  }
}

// PATCH update container
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing container ID." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from("containers")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updatedId: id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed updating container status." },
      { status: 500 }
    );
  }
}

// DELETE container
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing container ID." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from("containers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed deleting record." },
      { status: 500 }
    );
  }
}
