import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateWhatsAppMessage, evaluateContainerAlert } from "@/lib/alert-engine";
import { sendWhatsAppMessage } from "@/lib/gupshup";
import { getRemainingFreeDays } from "@/lib/lfd-calculator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId } = body;

    if (!containerId) {
      return NextResponse.json(
        { success: false, error: "Missing container ID parameter." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Fetch container details from database
    const { data: container, error: fetchError } = await supabase
      .from("containers")
      .select("*, firms(*)")
      .eq("id", containerId)
      .single();

    if (fetchError || !container) {
      return NextResponse.json(
        { success: false, error: "Container record not found." },
        { status: 404 }
      );
    }

    const remainingDays = getRemainingFreeDays(container.demurrage_lfd);
    const messageText = generateWhatsAppMessage(container, remainingDays);
    const recipientPhone = container.firms?.owner_phone || container.importer_phone || "+91 99999 99999";

    // Send WhatsApp dispatch via Gupshup
    const res = await sendWhatsAppMessage(recipientPhone, messageText);

    if (res.status === "failed") {
      return NextResponse.json(
        { success: false, error: res.error || "Gupshup API transmission failed." },
        { status: 502 }
      );
    }

    // Evaluate alert type (72h, 48h, 24h, lfd_day, overdue)
    const evaluation = evaluateContainerAlert(container.demurrage_lfd, container.empty_return_date);
    const alertType = evaluation.alertType || "overdue";

    // 1. Insert alert log into alerts table
    const { error: alertLogError } = await supabase
      .from("alerts")
      .insert({
        container_id: containerId,
        firm_id: container.firm_id,
        alert_type: alertType,
        sent_to: recipientPhone,
        sent_to_role: container.firms?.owner_phone === recipientPhone ? "owner" : "importer",
        message_text: messageText,
        delivery_status: "sent",
        gupshup_message_id: res.messageId,
      });

    if (alertLogError) console.error("Failed logging alert record to Supabase:", alertLogError);

    // 2. Update container notification flags
    const updates: any = {
      last_alert_sent_at: new Date().toISOString()
    };
    if (alertType === "72h") updates.alert_72h_sent = true;
    if (alertType === "48h") updates.alert_48h_sent = true;
    if (alertType === "24h") updates.alert_24h_sent = true;
    if (alertType === "lfd_day") updates.alert_lfd_sent = true;
    if (alertType === "overdue") updates.alert_overdue_count = (container.alert_overdue_count || 0) + 1;

    await supabase
      .from("containers")
      .update(updates)
      .eq("id", containerId);

    return NextResponse.json({
      success: true,
      messageId: res.messageId,
      recipient: recipientPhone,
    });
  } catch (error: any) {
    console.error("Alert dispatcher error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed dispatching alert." },
      { status: 500 }
    );
  }
}
