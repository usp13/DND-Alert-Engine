import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify cron secret token if set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized cron execution request." },
      { status: 401 }
    );
  }

  try {
    // Call alert evaluation checking routine internally
    const origin = new URL(request.url).origin;
    const checkRes = await fetch(`${origin}/api/alerts/check`, {
      method: "GET",
      headers: {
        // Forward authorization header or verify directly
      },
    });

    if (!checkRes.ok) throw new Error("Internal call to check alerts failed.");

    const checkData = await checkRes.json();

    return NextResponse.json({
      success: true,
      message: "Cron trigger finished successfully.",
      details: checkData,
    });
  } catch (error: any) {
    console.error("Cron route failure:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed running cron tasks." },
      { status: 550 }
    );
  }
}
