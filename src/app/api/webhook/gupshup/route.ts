import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { extractContainersFromPDF } from "@/lib/pdf-import-engine";

// GET for webhook verification mapping (Standard webhooks handshake)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("challenge") || searchParams.get("hub.challenge");

  return new Response(challenge || "ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

// POST for incoming messages processing
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Inbound Gupshup webhook event:", JSON.stringify(payload));

    // Handle inbound PDF attachments
    // Typically, payload.payload contains:
    // { type: "file", contentType: "application/pdf", url: "https://..." }
    const messageObj = payload.payload;

    if (messageObj && messageObj.type === "file" && messageObj.contentType === "application/pdf") {
      const pdfUrl = messageObj.url;
      console.log(`Discovered incoming PDF attachment URL: ${pdfUrl}`);

      // 1. Download the PDF payload
      const fileRes = await fetch(pdfUrl);
      const fileBuffer = await fileRes.arrayBuffer();
      const base64PDF = Buffer.from(fileBuffer).toString("base64");

      // 2. Parse PDF details via Gemini AI structures
      const extracted = await extractContainersFromPDF(base64PDF, "whatsapp_inbound.pdf");
      console.log("Gemini parsed inbound container array:", extracted);

      // 3. Confirm validation and insert into database under corresponding firm profile
      const supabase = createServerSupabaseClient();
      
      // Select first firm or resolve firm by phone matching sender: payload.payload.sender.phone
      // const { data: firm } = await supabase.from("firms").select("id").limit(1).single();
      // for (const container of extracted) {
      //   await supabase.from("containers").insert({ ...container, firmId: firm.id });
      // }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed processing webhook message." },
      { status: 500 }
    );
  }
}
