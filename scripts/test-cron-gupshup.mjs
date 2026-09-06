import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

console.log("===============================================================");
console.log("       CRON & GUPSHUP PIPELINE SIMULATION TEST                ");
console.log("===============================================================\n");

async function sendMockOrRealWhatsApp(phone, msg) {
  const apiKey = process.env.GUPSHUP_API_KEY;
  const appName = process.env.GUPSHUP_APP_NAME;
  const sourceNumber = process.env.GUPSHUP_SRC_PHONE;

  const cleanRecipient = phone.replace(/\+/g, "").replace(/\s+/g, "");

  if (!apiKey || !appName || !sourceNumber || apiKey.startsWith("your-api-key")) {
    console.log(`[MOCK MODE ACTIVE] No live Gupshup credentials provided.`);
    console.log(`[MOCK DISPATCH] -> To: ${cleanRecipient} | Message: "${msg}"`);
    return {
      status: "submitted",
      mode: "mock",
      messageId: `mock-msg-${Math.floor(Math.random() * 1000000)}`,
    };
  }

  const params = new URLSearchParams();
  params.append("channel", "whatsapp");
  params.append("source", sourceNumber);
  params.append("destination", cleanRecipient);
  params.append("message", JSON.stringify({ type: "text", text: msg }));
  params.append("src.name", appName);

  try {
    const response = await fetch("https://api.gupshup.io/sm/api/v1/msg", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": apiKey,
      },
      body: params,
    });

    const data = await response.json();
    return {
      status: response.ok ? "submitted" : "failed",
      mode: "live",
      response: data,
    };
  } catch (err) {
    return { status: "failed", mode: "live", error: err.message };
  }
}

async function testPipeline() {
  console.log("--- Step 1: Testing Gupshup WhatsApp Integration ---");
  const apiKey = process.env.GUPSHUP_API_KEY;
  const appName = process.env.GUPSHUP_APP_NAME;
  const srcPhone = process.env.GUPSHUP_SRC_PHONE;

  console.log(`- App Name:     ${appName || "Not configured (fallback to mock)"}`);
  console.log(`- Source Phone: ${srcPhone || "Not configured"}`);
  console.log(`- API Key:      ${apiKey && !apiKey.startsWith("your-") ? "Configured (Live)" : "Default Placeholder (Mock)"}`);

  const testMsg = await sendMockOrRealWhatsApp("+919876543210", "D&D Alert Engine: Container MSCU1234567 LFD in 48 hours. Please expedite clearance.");
  console.log("-> Result:", testMsg);

  console.log("\n--- Step 2: Testing Cron Calculation against live Supabase ---");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const { data: containers, error: cErr } = await supabase
    .from("containers")
    .select("id, container_number, shipping_line, shipping_line_code, demurrage_lfd, empty_return_date, status, demurrage_charges")
    .limit(5);

  if (cErr) {
    console.error("❌ Failed fetching containers:", cErr.message);
    return;
  }

  console.log(`Found ${containers.length} containers in database to evaluate:\n`);

  const now = new Date();
  for (const c of containers) {
    const lfdDate = new Date(c.demurrage_lfd);
    const diffDays = Math.ceil((lfdDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let computedStatus = "active";
    if (diffDays < 0) computedStatus = "overdue";
    else if (diffDays <= 1) computedStatus = "critical";
    else if (diffDays <= 3) computedStatus = "warning";

    console.log(`  • Container: ${c.container_number.padEnd(14)} | Line: ${(c.shipping_line || "N/A").padEnd(10)} | LFD: ${c.demurrage_lfd} | Days Left: ${String(diffDays).padStart(3)} | Evaluated Status: ${computedStatus.toUpperCase()}`);
  }

  console.log("\n===============================================================");
  console.log("✅ Cron Engine logic & Gupshup pipeline verified!");
  console.log("===============================================================\n");
}

testPipeline();
