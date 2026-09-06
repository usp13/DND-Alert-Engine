-- =========================================================================
-- Supabase Shipping Line Rules & D&D Tariffs Seed SQL
-- Run this script in your Supabase Dashboard > SQL Editor
-- =========================================================================

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure Table Structure
CREATE TABLE IF NOT EXISTS public.shipping_line_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
    line_name TEXT NOT NULL,
    line_code TEXT NOT NULL,
    port TEXT DEFAULT 'All Ports',
    container_type TEXT DEFAULT '40ft',
    model TEXT DEFAULT 'split',
    dem_free_days INTEGER NOT NULL DEFAULT 7,
    det_free_days INTEGER DEFAULT 7,
    combined_free_days INTEGER DEFAULT 14,
    slab1_days INTEGER DEFAULT 7,
    slab1_rate NUMERIC(10, 2) DEFAULT 3500,
    slab2_days INTEGER DEFAULT 7,
    slab2_rate NUMERIC(10, 2) DEFAULT 7000,
    slab3_rate NUMERIC(10, 2) DEFAULT 14000,
    calendar_basis TEXT DEFAULT 'Calendar Days',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Drop and update check constraint to be case-insensitive
ALTER TABLE public.shipping_line_rules DROP CONSTRAINT IF EXISTS shipping_line_rules_model_check;
ALTER TABLE public.shipping_line_rules ADD CONSTRAINT shipping_line_rules_model_check CHECK (LOWER(model) IN ('split', 'merged'));

-- 3. Enable RLS and public policy
ALTER TABLE public.shipping_line_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for shipping_line_rules" ON public.shipping_line_rules;
CREATE POLICY "Allow public read-write for shipping_line_rules" ON public.shipping_line_rules FOR ALL USING (true) WITH CHECK (true);

-- 4. Clear previous default seed records if needed
DELETE FROM public.shipping_line_rules WHERE is_custom = FALSE OR is_custom IS NULL;

-- 1. MAERSK (MSKU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('Maersk', 'MSKU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 3500, 7, 7000, 14000, 'Calendar Days'),
('Maersk', 'MSKU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 7000, 7, 14000, 28000, 'Calendar Days');

-- 2. MSC (MSCU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('MSC', 'MSCU', 'Kandla / Mundra', '20ft', 'split', 5, 7, 12, 7, 3000, 7, 6000, 12000, 'Calendar Days'),
('MSC', 'MSCU', 'Kandla / Mundra', '40ft', 'split', 5, 7, 12, 7, 6000, 7, 12000, 24000, 'Calendar Days');

-- 3. CMA CGM (CMAU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('CMA CGM', 'CMAU', 'Kandla / Mundra', '20ft', 'merged', 10, 0, 10, 7, 3000, 7, 6000, 10000, 'Calendar Days'),
('CMA CGM', 'CMAU', 'Kandla / Mundra', '40ft', 'merged', 10, 0, 10, 7, 6000, 7, 12000, 20000, 'Calendar Days');

-- 4. HAPAG-LLOYD (HLBU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('Hapag-Lloyd', 'HLBU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 3500, 7, 7000, 10500, 'Calendar Days'),
('Hapag-Lloyd', 'HLBU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 7000, 7, 14000, 21000, 'Calendar Days');

-- 5. ONE (ONEY)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('ONE', 'ONEY', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 3000, 7, 6000, 9000, 'Calendar Days'),
('ONE', 'ONEY', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 6000, 7, 12000, 18000, 'Calendar Days');

-- 6. EVERGREEN (EISU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('Evergreen', 'EISU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 2500, 7, 5000, 10000, 'Calendar Days'),
('Evergreen', 'EISU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 5000, 7, 10000, 20000, 'Calendar Days');

-- 7. COSCO (COSU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('COSCO', 'COSU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 3000, 7, 6000, 9000, 'Calendar Days'),
('COSCO', 'COSU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 6000, 7, 12000, 18000, 'Calendar Days');

-- 8. YANG MING (YMLU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('Yang Ming', 'YMLU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 2500, 7, 5000, 8000, 'Calendar Days'),
('Yang Ming', 'YMLU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 5000, 7, 10000, 16000, 'Calendar Days');

-- 9. HMM (HMMU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('HMM', 'HMMU', 'Kandla / Mundra', '20ft', 'split', 5, 5, 10, 7, 3000, 7, 6000, 12000, 'Calendar Days'),
('HMM', 'HMMU', 'Kandla / Mundra', '40ft', 'split', 5, 5, 10, 7, 6000, 7, 12000, 24000, 'Calendar Days');

-- 10. ZIM (ZIMU)
INSERT INTO public.shipping_line_rules (line_name, line_code, port, container_type, model, dem_free_days, det_free_days, combined_free_days, slab1_days, slab1_rate, slab2_days, slab2_rate, slab3_rate, calendar_basis)
VALUES 
('ZIM', 'ZIMU', 'Kandla / Mundra', '20ft', 'split', 7, 7, 14, 7, 3000, 7, 6000, 9000, 'Calendar Days'),
('ZIM', 'ZIMU', 'Kandla / Mundra', '40ft', 'split', 7, 7, 14, 7, 6000, 7, 12000, 18000, 'Calendar Days');
