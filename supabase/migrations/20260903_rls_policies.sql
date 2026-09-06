-- ==============================================================================
-- SUPABASE POSTGRES ROW LEVEL SECURITY (RLS) & MULTI-TENANT ISOLATION POLICIES
-- ==============================================================================

-- 1. Create public.profiles Table if not already created
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  firm_name text,
  contact_person text,
  mobile text,
  gstin text,
  city text,
  ops_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Performance Indexes for Foreign Keys & Tenant Resolution
CREATE INDEX IF NOT EXISTS idx_containers_firm_id ON public.containers(firm_id);
CREATE INDEX IF NOT EXISTS idx_containers_container_number ON public.containers(container_number);
CREATE INDEX IF NOT EXISTS idx_firms_auth_user_id ON public.firms(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_firm_id ON public.alerts(firm_id);
CREATE INDEX IF NOT EXISTS idx_alerts_container_id ON public.alerts(container_id);

-- 3. Enable Row Level Security on all Core Tables
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_line_rules ENABLE ROW LEVEL SECURITY;

-- 4. FIRMS Table Policies (Users can only access their own firm)
DROP POLICY IF EXISTS "Firms select own firm" ON public.firms;
DROP POLICY IF EXISTS "Firms insert own firm" ON public.firms;
DROP POLICY IF EXISTS "Firms update own firm" ON public.firms;
DROP POLICY IF EXISTS "Firms delete own firm" ON public.firms;

CREATE POLICY "Firms select own firm"
ON public.firms FOR SELECT
TO authenticated
USING (
  (select auth.uid()) = auth_user_id
);

CREATE POLICY "Firms insert own firm"
ON public.firms FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) = auth_user_id
);

CREATE POLICY "Firms update own firm"
ON public.firms FOR UPDATE
TO authenticated
USING (
  (select auth.uid()) = auth_user_id
)
WITH CHECK (
  (select auth.uid()) = auth_user_id
);

CREATE POLICY "Firms delete own firm"
ON public.firms FOR DELETE
TO authenticated
USING (
  (select auth.uid()) = auth_user_id
);

-- 5. CONTAINERS Table Policies (Tenants only access containers of their firm)
DROP POLICY IF EXISTS "Tenant containers select" ON public.containers;
DROP POLICY IF EXISTS "Tenant containers insert" ON public.containers;
DROP POLICY IF EXISTS "Tenant containers update" ON public.containers;
DROP POLICY IF EXISTS "Tenant containers delete" ON public.containers;

CREATE POLICY "Tenant containers select"
ON public.containers FOR SELECT
TO authenticated
USING (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Tenant containers insert"
ON public.containers FOR INSERT
TO authenticated
WITH CHECK (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Tenant containers update"
ON public.containers FOR UPDATE
TO authenticated
USING (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
)
WITH CHECK (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Tenant containers delete"
ON public.containers FOR DELETE
TO authenticated
USING (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

-- 6. ALERTS Table Policies
DROP POLICY IF EXISTS "Tenant alerts select" ON public.alerts;
DROP POLICY IF EXISTS "Tenant alerts insert" ON public.alerts;

CREATE POLICY "Tenant alerts select"
ON public.alerts FOR SELECT
TO authenticated
USING (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Tenant alerts insert"
ON public.alerts FOR INSERT
TO authenticated
WITH CHECK (
  firm_id IN (
    SELECT id FROM public.firms WHERE auth_user_id = (select auth.uid())
  )
);

-- 7. PROFILES Table Policies
DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;

CREATE POLICY "Profiles select own"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (select auth.uid()) = id
);

CREATE POLICY "Profiles insert own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) = id
);

CREATE POLICY "Profiles update own"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  (select auth.uid()) = id
)
WITH CHECK (
  (select auth.uid()) = id
);

-- 8. SHIPPING LINE RULES Table (Public Read-Only Reference Data)
DROP POLICY IF EXISTS "Public read shipping line rules" ON public.shipping_line_rules;

CREATE POLICY "Public read shipping line rules"
ON public.shipping_line_rules FOR SELECT
TO authenticated, anon
USING (true);
