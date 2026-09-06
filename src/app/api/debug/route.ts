import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  try {
    const supabase = createServerSupabaseClient();
    const startTime = Date.now();

    // 1. Test connection by querying containers table
    const { data: containers, error: containersError } = await supabase
      .from("containers")
      .select("id")
      .limit(5);

    // 2. Test querying firms table
    const { data: firms, error: firmsError } = await supabase
      .from("firms")
      .select("id")
      .limit(5);

    const latencyMs = Date.now() - startTime;

    if (containersError || firmsError) {
      return NextResponse.json({
        connected: false,
        error: containersError || firmsError,
        diagnostics: {
          urlConfigured: !!url,
          serviceKeyConfigured: !!serviceKey,
          anonKeyConfigured: !!(pubKey || anonKey),
          latencyMs,
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      connected: true,
      status: "Supabase successfully connected to Next.js backend!",
      latency: `${latencyMs}ms`,
      tables: {
        containers: { status: "OK", accessible: true, sampleCount: containers?.length ?? 0 },
        firms: { status: "OK", accessible: true, sampleCount: firms?.length ?? 0 },
      },
      env: {
        supabaseUrl: url ? `${url.substring(0, 20)}...` : "Missing",
        usingServiceRoleKey: !!serviceKey && serviceKey.length > 20,
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
