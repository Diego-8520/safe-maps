-- Enable Row Level Security (RLS) — read-only access for Safe Maps
-- Date: 2026-05-14
-- Purpose: Restrict public access to SELECT only; prevent INSERT/UPDATE/DELETE

-- ============================================================================
-- 1. DATA_SOURCES — public reference data
-- ============================================================================
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_sources_select_all ON public.data_sources
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 2. RISK_MODEL_VERSIONS — public reference data
-- ============================================================================
ALTER TABLE public.risk_model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_model_versions_select_all ON public.risk_model_versions
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 3. COMMUNES — core geospatial data
-- ============================================================================
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;

CREATE POLICY communes_select_all ON public.communes
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 4. COMMUNE_RISK_PROFILES — risk scores per commune
-- ============================================================================
ALTER TABLE public.commune_risk_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY commune_risk_profiles_select_all ON public.commune_risk_profiles
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 5. ANNUAL_CRIME_INDICATORS — historical metrics
-- ============================================================================
ALTER TABLE public.annual_crime_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY annual_crime_indicators_select_all ON public.annual_crime_indicators
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 6. RISK_MODEL_COEFFICIENTS — Euler model parameters
-- ============================================================================
ALTER TABLE public.risk_model_coefficients ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_model_coefficients_select_all ON public.risk_model_coefficients
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 7. RISK_TIME_WINDOWS — temporal risk profiles
-- ============================================================================
ALTER TABLE public.risk_time_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_time_windows_select_all ON public.risk_time_windows
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 8. COMMUNES_GEOJSON view — read-only GeoJSON; no RLS needed on view
-- ============================================================================
-- Views inherit RLS from underlying tables. communes_geojson depends on
-- communes, which now has RLS. No additional policy needed.

-- ============================================================================
-- Summary
-- ============================================================================
-- All tables now enforce RLS with SELECT-only policies.
-- Public (anon and authenticated) roles can read data via PostgREST.
-- INSERT, UPDATE, DELETE are blocked by default (no policy = no access).
-- Server-side operations using service_role bypass RLS entirely.
