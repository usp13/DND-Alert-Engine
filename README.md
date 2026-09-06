# 🚢 D&D Alert Engine

> **Intelligent Demurrage & Detention (D&D) Alert & Tracking Platform for Freight Forwarders, Customs Brokers (CHAs), and Importers.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-Vision%20AI-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Gupshup](https://img.shields.io/badge/Gupshup-WhatsApp%20API-25D366?style=flat-square&logo=whatsapp)](https://www.gupshup.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Overview

In maritime logistics and container shipping, **Demurrage & Detention (D&D) penalties** cost cargo owners and logistics companies millions of dollars annually due to missed Last Free Day (LFD) deadlines, complex multi-tier tariff slabs, and fragmented manual paperwork.

**D&D Alert Engine** automates the entire monitoring and alert lifecycle:
1. **AI Document Ingestion**: Ingests unstructured Delivery Orders (DO) and Bills of Lading (BL) via PDF upload or WhatsApp bot using Google Gemini Vision AI.
2. **Automated Tariff Calculation**: Computes exact free-time windows and multi-slab financial charges across 20+ major shipping lines (Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd, COSCO, etc.).
3. **Automated Alerts**: Sends multi-tier WhatsApp and email alerts at **72h, 48h, 24h, LFD Day, and Overdue intervals**.
4. **Operations Hub & Savings Analytics**: Provides financial metrics on demurrage penalties avoided vs. incurred, container lifecycle tracking, and exportable monthly executive reports.

---

## ⚡ Key Features

- 📄 **AI-Powered PDF Import Engine**: Upload any ocean carrier DO or BL (PDF/Scanned). Gemini AI automatically extracts container numbers, ISO codes, shipping lines, discharge dates, ports, and vessel details.
- ⏱️ **Real-Time LFD & Tariff Calculator**: Pre-configured with major ocean shipping line tariffs (India ports standard & global). Supports Split and Merged/Combined models, calendar vs. working days, and progressive tiered slab rates (Slab 1, 2, 3).
- 💬 **Gupshup WhatsApp Integration**: 
  - **Outbound**: Instant WhatsApp alerts to operations teams and cargo owners before penalties trigger.
  - **Inbound**: Forward PDF Delivery Orders directly to the WhatsApp bot for zero-click container ingestion.
- ⏰ **Automated Serverless Cron Engine**: Scheduled Vercel cron `/api/cron` runs every 4 hours with bearer-token security to recalculate statuses and fire proactive alerts.
- 🔒 **Multi-Tenant Supabase Architecture**: Multi-tenant database schema secured with PostgreSQL Row Level Security (RLS), custom profiles, and SSR cookie-based authentication.
- 📊 **Financial Savings Reports**: Visualizes total penalties avoided, overdue risks, and active port dwell times with Recharts analytics.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS, Supabase SSR Auth)
- **AI / OCR Engine**: [Google Gemini 1.5 / 2.0 API](https://ai.google.dev/) (`@google/generative-ai`)
- **Messaging Service**: [Gupshup WhatsApp Business API](https://www.gupshup.io/)
- **Spreadsheet Processing**: [XLSX (SheetJS)](https://sheetjs.com/)

---

## 📂 Project Architecture

```
dnd-alert-engine/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Registration, Password recovery
│   │   ├── (protected)/         # Authenticated dashboard, containers, tariffs, reports, settings
│   │   ├── api/
│   │   │   ├── alerts/          # /check and /send alert endpoints
│   │   │   ├── containers/      # Container CRUD API
│   │   │   ├── cron/            # Scheduled serverless cron evaluator
│   │   │   ├── import/          # PDF OCR parser & confirmation endpoints
│   │   │   ├── reports/         # Monthly savings report generator
│   │   │   └── webhook/gupshup/ # Inbound WhatsApp message & document webhook
│   │   ├── layout.tsx           # Root application layout
│   │   └── page.tsx             # Landing / Hero page
│   ├── components/              # UI components, tables, modals, charts
│   ├── lib/
│   │   ├── alert-engine.ts      # 72h / 48h / 24h / LFD alert rules logic
│   │   ├── dd-calculator.ts     # Multi-tier D&D slab computation
│   │   ├── gupshup.ts           # Gupshup WhatsApp API client
│   │   ├── pdf-import-engine.ts # Gemini AI document vision extraction
│   │   ├── supabase.ts          # Browser Supabase client
│   │   └── supabase-server.ts   # Server-side Supabase client & SSR cookies
│   └── types/                   # TypeScript schemas and database types
├── scripts/
│   ├── test-supabase.mjs        # Rigorous 19-point Supabase pre-deployment test suite
│   ├── test-cron-gupshup.mjs    # Cron & WhatsApp simulation testing script
│   └── generate-samples.js      # Sample Delivery Order PDF generator
├── supabase/
│   ├── migrations/              # RLS policies and table schema migrations
│   └── supabase_schema.sql      # Complete SQL database schema
├── vercel.json                  # Vercel Cron configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ (v20+ recommended)
- **npm** or **pnpm**
- A **Supabase** project
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- (Optional) A **Gupshup WhatsApp Account** (for live messaging; mock fallback is built-in)

---

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/<your-username>/dnd-alert-engine.git
cd dnd-alert-engine
npm install
```

---

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Generative AI (Gemini OCR)
GEMINI_API_KEY=your_google_gemini_api_key

# Scheduled Alert Cron Authentication
CRON_SECRET=your_secure_random_cron_secret

# Gupshup WhatsApp Business API (Optional - runs in mock mode if omitted)
GUPSHUP_APP_NAME=your_gupshup_app_name
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_SRC_PHONE=919999999999
GUPSHUP_WEBHOOK_SECRET=your_gupshup_webhook_secret
```

---

### 4. Database Setup

1. Open your **Supabase Dashboard** $\rightarrow$ **SQL Editor**.
2. Run the contents of [`supabase_schema.sql`](file:///c:/Users/91886/Downloads/dnd-alert-engine/supabase_schema.sql) to create tables (`firms`, `containers`, `shipping_line_rules`, `alerts`, `pdf_imports`, `monthly_reports`, `profiles`).
3. Run [`supabase_tariffs_seed.sql`](file:///c:/Users/91886/Downloads/dnd-alert-engine/supabase_tariffs_seed.sql) to seed default tariff rules for the top 20 shipping lines.
4. Run [`supabase/migrations/20260903_rls_policies.sql`](file:///c:/Users/91886/Downloads/dnd-alert-engine/supabase/migrations/20260903_rls_policies.sql) to enable multi-tenant Row Level Security (RLS).

---

### 5. Run Database & Pipeline Tests

Verify your database connectivity, schema tables, foreign key cascades, and tariff rules:

```bash
# Run comprehensive 19-point Supabase test suite
npm run test:supabase

# Test Cron calculation and Gupshup alert simulation
node scripts/test-cron-gupshup.mjs
```

---

### 6. Start the Local Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## 🚢 Deployment (Vercel)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: initial commit"
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set Framework Preset to **Next.js**.
3. Add all environment variables from `.env.local` into **Project Settings $\rightarrow$ Environment Variables**.
4. Click **Deploy**.

### Step 3: Configure Supabase Auth URL
1. In your **Supabase Dashboard** $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**:
   - **Site URL**: `https://<your-vercel-app>.vercel.app`
   - **Redirect URLs**: `https://<your-vercel-app>.vercel.app/**`

### Step 4: Configure WhatsApp Webhook (Optional)
In your Gupshup Dashboard, set your inbound webhook callback to:
```
https://<your-vercel-app>.vercel.app/api/webhook/gupshup
```

---

## 🧪 Testing Utilities

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Validates TypeScript types and compiles optimized production build |
| `npm run test:supabase` | Executes automated 19-point pre-deployment health check against Supabase |
| `npm run generate:pdfs` | Generates realistic sample ocean carrier DO/BL PDFs for testing OCR |

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Enforced across all tenant tables so that organizations can never read or modify another firm's containers.
- **Service Role Isolation**: Unprivileged `anon` keys only access public reference tables (e.g. shipping tariffs); the `SUPABASE_SERVICE_ROLE_KEY` is strictly reserved for server-side cron routines and webhook ingestion.
- **Protected Cron Endpoints**: `/api/cron` requires a cryptographically random `CRON_SECRET` bearer token.

---

## 📄 License

This project is licensed under the **MIT License**.
