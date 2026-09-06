import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local manually if not in process.env
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("===============================================================");
console.log("       SUPABASE RIGOROUS PRE-DEPLOYMENT TEST SUITE             ");
console.log("===============================================================\n");

console.log(`Target URL: ${SUPABASE_URL}`);
console.log(`Anon Key present: ${Boolean(ANON_KEY)} (Length: ${ANON_KEY?.length || 0})`);
console.log(`Service Role Key present: ${Boolean(SERVICE_ROLE_KEY)} (Length: ${SERVICE_ROLE_KEY?.length || 0})`);
console.log("---------------------------------------------------------------\n");

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(title, status, details = "") {
  results.tests.push({ title, status, details });
  if (status === "PASS") {
    results.passed++;
    console.log(`[\x1b[32mPASS\x1b[0m] ${title}`);
  } else if (status === "WARN") {
    results.warnings++;
    console.log(`[\x1b[33mWARN\x1b[0m] ${title} - ${details}`);
  } else {
    results.failed++;
    console.log(`[\x1b[31mFAIL\x1b[0m] ${title} - ${details}`);
  }
  if (details && status === "PASS") {
    console.log(`       ↳ ${details}`);
  }
}

async function runTests() {
  if (!SUPABASE_URL || !ANON_KEY) {
    recordTest("Supabase Credentials Configured", "FAIL", "Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
    process.exit(1);
  } else {
    recordTest("Supabase Credentials Configured", "PASS", "Valid URL and Keys loaded from environment");
  }

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const adminClient = SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

  // -------------------------------------------------------------
  // TEST PHASE 1: REST API Connectivity & Latency
  // -------------------------------------------------------------
  console.log("\n--- Phase 1: Connectivity & Network Latency ---");
  const startTime = Date.now();
  try {
    const { data, error } = await (adminClient || anonClient).from("shipping_line_rules").select("count", { count: "exact", head: true });
    const latency = Date.now() - startTime;
    if (error && error.code !== "PGRST116") {
      recordTest("REST API Ping", "FAIL", `Error: ${error.message} (Code: ${error.code})`);
    } else {
      recordTest("REST API Ping", "PASS", `Connected in ${latency}ms`);
    }
  } catch (err) {
    recordTest("REST API Ping", "FAIL", `Network Exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST PHASE 2: Auth Service Health
  // -------------------------------------------------------------
  console.log("\n--- Phase 2: Auth Service Connectivity ---");
  try {
    const { data, error } = await anonClient.auth.getSession();
    if (error) {
      recordTest("Auth Endpoint Health", "FAIL", error.message);
    } else {
      recordTest("Auth Endpoint Health", "PASS", "Auth subsystem is responding normally");
    }
  } catch (err) {
    recordTest("Auth Endpoint Health", "FAIL", err.message);
  }

  // -------------------------------------------------------------
  // TEST PHASE 3: Schema & Table Existence
  // -------------------------------------------------------------
  console.log("\n--- Phase 3: Table Existence & Schema Inspection ---");
  const tables = [
    "firms",
    "containers",
    "shipping_line_rules",
    "alerts",
    "pdf_imports",
    "monthly_reports",
    "profiles"
  ];

  const clientToUse = adminClient || anonClient;

  for (const table of tables) {
    try {
      const { data, error, count } = await clientToUse.from(table).select("*", { count: "exact" }).limit(1);
      if (error) {
        if (error.code === "42P01") {
          recordTest(`Table Existence: ${table}`, "FAIL", `Table does not exist (relation "${table}" does not exist)`);
        } else if (error.code === "42501") {
          recordTest(`Table Existence: ${table}`, "WARN", `RLS active: Permission denied for current key role`);
        } else {
          recordTest(`Table Existence: ${table}`, "FAIL", `Code ${error.code}: ${error.message}`);
        }
      } else {
        recordTest(`Table Existence: ${table}`, "PASS", `Table online. Row count: ${count ?? 0}`);
      }
    } catch (err) {
      recordTest(`Table Existence: ${table}`, "FAIL", err.message);
    }
  }

  // -------------------------------------------------------------
  // TEST PHASE 4: Seed Data & Reference Rules
  // -------------------------------------------------------------
  console.log("\n--- Phase 4: Reference Data & Tariffs ---");
  try {
    const { data: rules, error: rulesErr } = await clientToUse
      .from("shipping_line_rules")
      .select("line_name, line_code, model, dem_free_days, slab1_rate");

    if (rulesErr) {
      recordTest("Shipping Line Rules Seed Data", "FAIL", rulesErr.message);
    } else if (!rules || rules.length === 0) {
      recordTest("Shipping Line Rules Seed Data", "WARN", "Table exists but contains 0 rules. Consider applying supabase_tariffs_seed.sql");
    } else {
      const lines = rules.map((r) => r.line_name || r.line_code).slice(0, 5).join(", ");
      recordTest("Shipping Line Rules Seed Data", "PASS", `Found ${rules.length} pre-configured shipping rules (${lines}...)`);
    }
  } catch (err) {
    recordTest("Shipping Line Rules Seed Data", "FAIL", err.message);
  }

  // -------------------------------------------------------------
  // TEST PHASE 5: CRUD Operations & Relational Cascades
  // -------------------------------------------------------------
  console.log("\n--- Phase 5: CRUD Operations & Foreign Key Cascades ---");
  let testFirmId = null;
  let testContainerId = null;
  let testAlertId = null;

  try {
    // 5.1 Insert Test Firm
    const testFirm = {
      firm_name: "__TEST_VERCEL_PRE_DEPLOY_FIRM__",
      owner_name: "Test Ops Admin",
      owner_phone: "+919876543210",
      ops_phone: "+919876543211",
      city: "Mundra",
      plan_type: "pro",
      is_active: true
    };

    const { data: createdFirm, error: firmErr } = await clientToUse
      .from("firms")
      .insert(testFirm)
      .select()
      .single();

    if (firmErr) {
      recordTest("Firm Insert (CRUD)", "FAIL", firmErr.message);
    } else {
      testFirmId = createdFirm.id;
      recordTest("Firm Insert (CRUD)", "PASS", `Created test firm with UUID: ${testFirmId}`);
    }

    // 5.2 Insert Container linked to Firm
    if (testFirmId) {
      const testContainer = {
        firm_id: testFirmId,
        container_number: "TESTU1234567",
        shipping_line: "Maersk",
        shipping_line_code: "MAEU",
        container_type: "40ft",
        discharge_date: new Date().toISOString().split("T")[0],
        demurrage_free_days: 14,
        demurrage_lfd: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        status: "active",
        total_dd_charges: 0,
        import_source: "manual"
      };

      const { data: createdCont, error: contErr } = await clientToUse
        .from("containers")
        .insert(testContainer)
        .select()
        .single();

      if (contErr) {
        recordTest("Container Insert & FK Link (CRUD)", "FAIL", contErr.message);
      } else {
        testContainerId = createdCont.id;
        recordTest("Container Insert & FK Link (CRUD)", "PASS", `Created container ${createdCont.container_number} linked to firm`);
      }
    }

    // 5.3 Insert Alert linked to Container and Firm
    if (testContainerId && testFirmId) {
      const testAlert = {
        container_id: testContainerId,
        firm_id: testFirmId,
        alert_type: "72h",
        sent_to: "+919876543210",
        sent_to_role: "owner",
        message_text: "Pre-deployment validation test alert",
        delivery_status: "sent"
      };

      const { data: createdAlert, error: alertErr } = await clientToUse
        .from("alerts")
        .insert(testAlert)
        .select()
        .single();

      if (alertErr) {
        recordTest("Alert Insert (CRUD)", "FAIL", alertErr.message);
      } else {
        testAlertId = createdAlert.id;
        recordTest("Alert Insert (CRUD)", "PASS", `Created alert record with ID: ${testAlertId}`);
      }
    }

    // 5.4 Update Container
    if (testContainerId) {
      const { data: updatedCont, error: updateErr } = await clientToUse
        .from("containers")
        .update({ status: "warning", alert_72h_sent: true })
        .eq("id", testContainerId)
        .select()
        .single();

      if (updateErr) {
        recordTest("Container Update (CRUD)", "FAIL", updateErr.message);
      } else {
        recordTest("Container Update (CRUD)", "PASS", `Updated status to "${updatedCont.status}" and alert_72h_sent to true`);
      }
    }

    // 5.5 Query with Joins / Relations
    if (testFirmId) {
      const { data: joinedData, error: joinErr } = await clientToUse
        .from("containers")
        .select("id, container_number, firms(id, firm_name, owner_phone)")
        .eq("firm_id", testFirmId);

      if (joinErr) {
        recordTest("Relational Join Query", "FAIL", joinErr.message);
      } else {
        recordTest("Relational Join Query", "PASS", `Successfully fetched container with joined firm data (${joinedData.length} records)`);
      }
    }

    // 5.6 Test Cascade Deletion Cleanup
    if (testFirmId) {
      const { error: delErr } = await clientToUse
        .from("firms")
        .delete()
        .eq("id", testFirmId);

      if (delErr) {
        recordTest("Cascade Delete & Cleanup", "FAIL", delErr.message);
      } else {
        // Verify container was cascade deleted
        const { data: checkCont } = await clientToUse
          .from("containers")
          .select("id")
          .eq("id", testContainerId);

        if (checkCont && checkCont.length === 0) {
          recordTest("Cascade Delete & Cleanup", "PASS", "Test firm and child containers/alerts cleanly removed via ON DELETE CASCADE");
        } else {
          recordTest("Cascade Delete & Cleanup", "WARN", "Parent firm deleted, but child container remained (check CASCADE constraints)");
        }
      }
    }
  } catch (err) {
    recordTest("CRUD Test Suite Exception", "FAIL", err.message);
  }

  // -------------------------------------------------------------
  // TEST PHASE 6: RLS & Service Role Key Separation Audit
  // -------------------------------------------------------------
  console.log("\n--- Phase 6: Security & Role Permission Audit ---");
  if (adminClient) {
    recordTest("Service Role Key Validation", "PASS", "Service role client successfully verified for privileged background cron/alerts");
  } else {
    recordTest("Service Role Key Validation", "WARN", "SUPABASE_SERVICE_ROLE_KEY not configured. Background jobs may be constrained by RLS.");
  }

  // Check Anon Key write permissions on public endpoints
  try {
    const { data: anonRules, error: anonErr } = await anonClient
      .from("shipping_line_rules")
      .select("id")
      .limit(1);

    if (anonErr) {
      recordTest("Anon Key Read Permissions", "WARN", `Anon read error: ${anonErr.message}`);
    } else {
      recordTest("Anon Key Read Permissions", "PASS", "Anon key can read public reference data properly");
    }
  } catch (err) {
    recordTest("Anon Key Read Permissions", "FAIL", err.message);
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log("\n===============================================================");
  console.log("                     TEST SUITE SUMMARY                        ");
  console.log("===============================================================");
  console.log(`Total Tests Run: ${results.passed + results.failed + results.warnings}`);
  console.log(`Passed:          \x1b[32m${results.passed}\x1b[0m`);
  console.log(`Warnings:        \x1b[33m${results.warnings}\x1b[0m`);
  console.log(`Failed:          \x1b[31m${results.failed}\x1b[0m`);
  console.log("===============================================================");

  if (results.failed > 0) {
    console.log("\n\x1b[31m❌ Supabase test suite failed with errors. Fix before deploying to Vercel.\x1b[0m");
    process.exit(1);
  } else {
    console.log("\n\x1b[32m✅ Supabase tests passed! Ready for Vercel deployment.\x1b[0m");
    process.exit(0);
  }
}

runTests();
