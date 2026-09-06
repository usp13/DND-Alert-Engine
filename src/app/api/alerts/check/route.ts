import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { evaluateContainerAlert } from "@/lib/alert-engine";
import { calculateContainerCharges } from "@/lib/dd-calculator";

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch outstanding containers (not yet returned)
    const { data: containers, error: containersError } = await supabase
      .from("containers")
      .select("*, firms(plan_type)")
      .is("empty_return_date", null);

    if (containersError) throw containersError;

    // Fetch shipping line rules matching lines
    const { data: rulesList, error: rulesError } = await supabase
      .from("shipping_line_rules")
      .select("*");

    if (rulesError) throw rulesError;

    let scanCount = 0;
    let updateCount = 0;

    for (const container of (containers || [])) {
      scanCount++;

      // Find matching ruleset by code (e.g. MAEU) or line name
      const matchingRules = rulesList?.find(
        (r) => 
          r.line_code.toLowerCase() === container.shipping_line_code.toLowerCase() ||
          r.line_name.toLowerCase() === container.shipping_line.toLowerCase()
      );

      // 1. Calculate demurrage charges based on slabs
      const { demurrageCharges, overdueDays } = calculateContainerCharges(
        container.demurrage_lfd,
        container.empty_return_date,
        matchingRules
      );

      // 2. Resolve status based on remaining free days
      const { status } = evaluateContainerAlert(
        container.demurrage_lfd,
        container.empty_return_date
      );

      // 3. Compare and save changes if updated
      const totalCharges = demurrageCharges; // assuming demurrage is primary for port tracker
      const hasChanges = 
        container.status !== status || 
        Number(container.demurrage_charges) !== totalCharges ||
        Number(container.total_dd_charges) !== totalCharges;

      if (hasChanges) {
        const { error: updateError } = await supabase
          .from("containers")
          .update({
            status,
            demurrage_charges: totalCharges,
            total_dd_charges: totalCharges,
            updated_at: new Date().toISOString()
          })
          .eq("id", container.id);

        if (updateError) console.error(`Failed updating container ${container.id}:`, updateError);
        else updateCount++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: scanCount,
      updatesApplied: updateCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Alert scanner cron error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed running alert scanner." },
      { status: 500 }
    );
  }
}
