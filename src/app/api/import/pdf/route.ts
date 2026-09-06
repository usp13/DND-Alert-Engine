import { NextResponse } from "next/server";
import { extractContainersFromPDF } from "@/lib/pdf-import-engine";

export async function POST(request: Request) {
  try {
    const { pdfBase64, fileName } = await request.json();

    if (!pdfBase64 || !fileName) {
      return NextResponse.json(
        { success: false, error: "Missing pdfBase64 or fileName parameter." },
        { status: 400 }
      );
    }

    // Call parsing pipeline
    const containers = await extractContainersFromPDF(pdfBase64, fileName);

    return NextResponse.json({
      success: true,
      containers,
    });
  } catch (error: any) {
    console.error("PDF API parser error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed processing document parsing." },
      { status: 500 }
    );
  }
}
