-- =======================================================
-- Supabase Schema for D&D Alert Engine
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FIRMS TABLE
CREATE TABLE IF NOT EXISTS public.firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    firm_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    ops_phone TEXT,
    gstin TEXT,
    city TEXT,
    plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'starter', 'pro')),
    containers_limit INTEGER DEFAULT 50,
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTAINERS TABLE
CREATE TABLE IF NOT EXISTS public.containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    container_number TEXT NOT NULL,
    shipping_line TEXT NOT NULL,
    shipping_line_code TEXT,
    container_type TEXT DEFAULT '40ft',
    bl_number TEXT,
    bl_date DATE,
    vessel_name TEXT,
    port TEXT,
    importer_name TEXT,
    importer_phone TEXT,
    discharge_date DATE NOT NULL,
    gate_out_date DATE,
    empty_return_date DATE,
    demurrage_free_days INTEGER NOT NULL DEFAULT 14,
    detention_free_days INTEGER DEFAULT 0,
    demurrage_lfd DATE NOT NULL,
    detention_lfd DATE,
    combined_lfd DATE,
    model TEXT DEFAULT 'merged',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'warning', 'critical', 'overdue', 'cleared', 'closed')),
    demurrage_status TEXT,
    detention_status TEXT,
    demurrage_charges NUMERIC(12, 2) DEFAULT 0,
    detention_charges NUMERIC(12, 2) DEFAULT 0,
    total_dd_charges NUMERIC(12, 2) DEFAULT 0,
    alert_72h_sent BOOLEAN DEFAULT FALSE,
    alert_48h_sent BOOLEAN DEFAULT FALSE,
    alert_24h_sent BOOLEAN DEFAULT FALSE,
    alert_lfd_sent BOOLEAN DEFAULT FALSE,
    alert_overdue_count INTEGER DEFAULT 0,
    last_alert_sent_at TIMESTAMPTZ,
    notes TEXT,
    import_source TEXT DEFAULT 'manual' CHECK (import_source IN ('manual', 'whatsapp', 'web_upload', 'bulk_excel')),
    import_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SHIPPING LINE RULES
CREATE TABLE IF NOT EXISTS public.shipping_line_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    line_name TEXT NOT NULL,
    line_code TEXT NOT NULL,
    port TEXT,
    container_type TEXT DEFAULT '40ft',
    model TEXT DEFAULT 'merged' CHECK (model IN ('split', 'merged')),
    dem_free_days INTEGER NOT NULL DEFAULT 14,
    det_free_days INTEGER DEFAULT 0,
    combined_free_days INTEGER DEFAULT 14,
    slab1_days INTEGER DEFAULT 7,
    slab1_rate NUMERIC(10, 2) DEFAULT 2500,
    slab2_days INTEGER DEFAULT 7,
    slab2_rate NUMERIC(10, 2) DEFAULT 4500,
    slab3_rate NUMERIC(10, 2) DEFAULT 7500,
    calendar_basis TEXT DEFAULT 'calendar_days',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID REFERENCES public.containers(id) ON DELETE CASCADE,
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('72h', '48h', '24h', 'lfd_day', 'overdue', 'cleared')),
    sent_to TEXT NOT NULL,
    sent_to_role TEXT DEFAULT 'owner',
    message_text TEXT,
    delivery_status TEXT DEFAULT 'sent',
    gupshup_message_id TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PDF IMPORTS TABLE
CREATE TABLE IF NOT EXISTS public.pdf_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    containers_found INTEGER DEFAULT 0,
    containers_added INTEGER DEFAULT 0,
    containers_skipped INTEGER DEFAULT 0,
    vessel_name TEXT,
    port TEXT,
    discharge_date DATE,
    raw_extraction JSONB,
    source TEXT DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'web_upload')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MONTHLY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    report_month TEXT NOT NULL,
    containers_tracked INTEGER DEFAULT 0,
    alerts_sent INTEGER DEFAULT 0,
    containers_saved INTEGER DEFAULT 0,
    containers_overdue INTEGER DEFAULT 0,
    dd_avoided_amount NUMERIC(12, 2) DEFAULT 0,
    dd_incurred_amount NUMERIC(12, 2) DEFAULT 0,
    report_url TEXT,
    sent_to_owner BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_line_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting existing policies first
DROP POLICY IF EXISTS "Allow public read-write for firms" ON public.firms;
DROP POLICY IF EXISTS "Allow public read-write for containers" ON public.containers;
DROP POLICY IF EXISTS "Allow public read-write for shipping_line_rules" ON public.shipping_line_rules;
DROP POLICY IF EXISTS "Allow public read-write for alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow public read-write for pdf_imports" ON public.pdf_imports;
DROP POLICY IF EXISTS "Allow public read-write for monthly_reports" ON public.monthly_reports;

-- Allow full access for anon & authenticated users
CREATE POLICY "Allow public read-write for firms" ON public.firms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for containers" ON public.containers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for shipping_line_rules" ON public.shipping_line_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for pdf_imports" ON public.pdf_imports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for monthly_reports" ON public.monthly_reports FOR ALL USING (true) WITH CHECK (true);
