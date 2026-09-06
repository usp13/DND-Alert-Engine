# Supabase Integration Guide - DnD Alert Engine

Since the project already has `@supabase/supabase-js` installed and configured inside the skeleton files, you can connect your database in three straightforward steps.

---

## Step 1: Run your SQL Queries in Supabase

1. Go to your [Supabase Dashboard](https://database.supabase.com/) and select your project.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New query** and paste your SQL schema query commands.
4. Click **Run** to execute. This should create your tables (e.g. `firms`, `containers`, `rules`, `import_history`) and configure Row Level Security (RLS) policies.

---

## Step 2: Configure Environment Variables

Open your local [.env.local](file:///c:/Users/91886/Downloads/dnd-alert-engine/.env.local) file and replace the placeholder values with your real API keys found under **Project Settings -> API** in Supabase:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your project URL.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Safe to expose client-side. Used by [supabase.ts](file:///c:/Users/91886/Downloads/dnd-alert-engine/src/lib/supabase.ts) in the browser.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Private key used exclusively on the server (like in [supabase-server.ts](file:///c:/Users/91886/Downloads/dnd-alert-engine/src/lib/supabase-server.ts)) to bypass Row Level Security for CRON/Webhooks if necessary.

---

## Step 3: Replace Mock Handlers with Database Queries

You can replace the mock comment sections inside our API Route Handlers with real Supabase commands. Here are the core queries mapped to their respective files:

### 1. Fetching & Managing Containers
Update [src/app/api/containers/route.ts](file:///c:/Users/91886/Downloads/dnd-alert-engine/src/app/api/containers/route.ts):

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Fetch Containers list
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: containers, error } = await supabase
      .from("containers")
      .select("*")
      .order("lfd", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, containers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Insert Container record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    const { data: container, error } = await supabase
      .from("containers")
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, container });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 2. Running the CRON Risk Scanner
Update [src/app/api/alerts/check/route.ts](file:///c:/Users/91886/Downloads/dnd-alert-engine/src/app/api/alerts/check/route.ts) to run dynamic status recalculations and persist them back to Supabase:

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { evaluateContainerAlert } from "@/lib/alert-engine";

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch active containers along with alert buffer rules from the firm table
    const { data: activeContainers, error } = await supabase
      .from("containers")
      .select("*, firms(alert_settings)")
      .neq("status", "gate_out");

    if (error) throw error;

    let scanCount = 0;

    for (const container of activeContainers) {
      const evaluation = evaluateContainerAlert(
        container.lfd,
        container.gate_out_date,
        container.firms?.alert_settings
      );

      // Save updated statuses back to Supabase
      if (evaluation.status !== container.status || evaluation.alertLevel !== container.alert_level) {
        await supabase
          .from("containers")
          .update({ status: evaluation.status, alert_level: evaluation.alertLevel })
          .eq("id", container.id);
          
        scanCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount: scanCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 3. Bulk Insert Confirmed DO Container Lists
Update [src/app/api/import/confirm/route.ts](file:///c:/Users/91886/Downloads/dnd-alert-engine/src/app/api/import/confirm/route.ts):

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { containers, firmId } = await request.json();
    const supabase = createServerSupabaseClient();
    
    const rows = containers.map((c: any) => ({
      container_number: c.containerNumber,
      shipping_line: c.shippingLine,
      free_days: c.freeDays,
      eta: c.eta,
      booking_number: c.bookingNumber,
      bl_number: c.blNumber,
      lfd: c.lfd,
      firm_id: firmId,
      status: "active",
      alert_level: "green"
    }));

    const { error } = await supabase.from("containers").insert(rows);
    if (error) throw error;

    return NextResponse.json({ success: true, insertedCount: rows.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```
