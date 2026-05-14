-- =============================================================================
-- Safe Maps — Initial Schema Migration
-- Version: 20260514_initial_schema
-- Status: DRAFT — not yet applied to any Supabase project
--
-- DO NOT run this migration against production without review.
-- Apply via: supabase db push (after linking project)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Table: data_sources
-- Audit registry of all data origins used in Safe Maps.
-- ---------------------------------------------------------------------------

CREATE TABLE data_sources (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  source_type       text        NOT NULL,
  url               text,
  description       text,
  reliability_level text,
  collected_at      date,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT data_sources_source_type_check
    CHECK (source_type IN ('official', 'academic', 'simulated', 'estimated')),
  CONSTRAINT data_sources_reliability_check
    CHECK (reliability_level IN ('alta', 'media', 'baja', 'simulada') OR reliability_level IS NULL)
);

COMMENT ON TABLE  data_sources IS 'Registry of data sources used for risk profiles and crime indicators.';
COMMENT ON COLUMN data_sources.source_type IS 'official | academic | simulated | estimated';
COMMENT ON COLUMN data_sources.reliability_level IS 'alta | media | baja | simulada';

-- ---------------------------------------------------------------------------
-- Table: communes
-- Official commune polygons for Cali (22 communes).
-- Geometry loaded separately from IDESC GeoJSON.
-- ---------------------------------------------------------------------------

CREATE TABLE communes (
  id               uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id          text     UNIQUE NOT NULL,
  comuna_numero    smallint UNIQUE NOT NULL,
  name             text     NOT NULL,
  city             text     NOT NULL DEFAULT 'Santiago de Cali',
  department       text     NOT NULL DEFAULT 'Valle del Cauca',
  country          text     NOT NULL DEFAULT 'Colombia',
  geometry         geometry(MultiPolygon, 4326),  -- nullable until GeoJSON seed runs
  geometry_source  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT communes_numero_range
    CHECK (comuna_numero BETWEEN 1 AND 22)
);

-- GiST index for ST_Within spatial queries (PostGIS commune lookup)
CREATE INDEX communes_geometry_gist ON communes USING GIST (geometry);
CREATE INDEX communes_zona_id_idx   ON communes (zona_id);
CREATE INDEX communes_numero_idx    ON communes (comuna_numero);

CREATE TRIGGER set_communes_updated_at
  BEFORE UPDATE ON communes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  communes IS '22 official communes of Santiago de Cali. Geometry from IDESC.';
COMMENT ON COLUMN communes.geometry IS 'MultiPolygon WGS84. Nullable until GeoJSON seed is applied.';
COMMENT ON COLUMN communes.zona_id  IS 'Natural key from Excel dataset (dim_zonas.zona_id).';

-- ---------------------------------------------------------------------------
-- Table: risk_model_versions
-- Versioned risk model definitions.
-- ---------------------------------------------------------------------------

CREATE TABLE risk_model_versions (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text     UNIQUE NOT NULL,
  name        text     NOT NULL,
  description text,
  formula     text     NOT NULL,
  is_active   boolean  NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  risk_model_versions IS 'Versioned risk model definitions. euler-v1 is the initial model.';
COMMENT ON COLUMN risk_model_versions.code      IS 'Machine identifier: euler-v1, euler-v2, logistic-v1, etc.';
COMMENT ON COLUMN risk_model_versions.formula   IS 'Human-readable formula string.';
COMMENT ON COLUMN risk_model_versions.is_active IS 'Only one model should be active at a time for production use.';

-- ---------------------------------------------------------------------------
-- Table: risk_model_coefficients
-- Per-variable coefficients for each model version.
-- ---------------------------------------------------------------------------

CREATE TABLE risk_model_coefficients (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid         NOT NULL REFERENCES risk_model_versions(id) ON DELETE CASCADE,
  variable_code    text         NOT NULL,
  variable_name    text         NOT NULL,
  coefficient      numeric(10,4) NOT NULL,
  effect_direction text         NOT NULL,
  created_at       timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT risk_model_coefficients_unique
    UNIQUE (model_version_id, variable_code),
  CONSTRAINT risk_model_coefficients_direction_check
    CHECK (effect_direction IN ('increase', 'decrease'))
);

COMMENT ON TABLE  risk_model_coefficients IS 'Coefficients per variable per model version.';
COMMENT ON COLUMN risk_model_coefficients.variable_code    IS 'Symbol: C, S, V, I, F';
COMMENT ON COLUMN risk_model_coefficients.effect_direction IS 'increase | decrease — direction of risk contribution';

-- ---------------------------------------------------------------------------
-- Table: commune_risk_profiles
-- Risk profile per commune per time period.
-- Variables in scale 0–100 (normalized from source 0–10 via ×10).
-- ---------------------------------------------------------------------------

CREATE TABLE commune_risk_profiles (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id       uuid         NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  model_version_id uuid         REFERENCES risk_model_versions(id),
  valid_from       date         NOT NULL,
  valid_to         date,                          -- NULL = currently active profile
  criminalidad     numeric(5,2) NOT NULL,         -- 0–100
  seguridad        numeric(5,2) NOT NULL,         -- 0–100
  vigilancia       numeric(5,2) NOT NULL,         -- 0–100
  iluminacion      numeric(5,2) NOT NULL,         -- 0–100
  flujo_personas   numeric(5,2) NOT NULL,         -- 0–100
  risk_score       numeric(5,2) NOT NULL,         -- 0–100 (calculated)
  risk_level       text         NOT NULL,         -- low | medium | high
  data_quality     text,                          -- real | estimated | simulated
  source_id        uuid         REFERENCES data_sources(id),
  notes            text,
  created_at       timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT crp_unique_profile
    UNIQUE (commune_id, valid_from, model_version_id),
  CONSTRAINT crp_criminalidad_range   CHECK (criminalidad   BETWEEN 0 AND 100),
  CONSTRAINT crp_seguridad_range      CHECK (seguridad      BETWEEN 0 AND 100),
  CONSTRAINT crp_vigilancia_range     CHECK (vigilancia     BETWEEN 0 AND 100),
  CONSTRAINT crp_iluminacion_range    CHECK (iluminacion    BETWEEN 0 AND 100),
  CONSTRAINT crp_flujo_range          CHECK (flujo_personas BETWEEN 0 AND 100),
  CONSTRAINT crp_risk_score_range     CHECK (risk_score     BETWEEN 0 AND 100),
  CONSTRAINT crp_risk_level_check     CHECK (risk_level IN ('low', 'medium', 'high')),
  CONSTRAINT crp_valid_period_check   CHECK (valid_to IS NULL OR valid_to >= valid_from),
  CONSTRAINT crp_data_quality_check   CHECK (data_quality IN ('real', 'estimated', 'simulated') OR data_quality IS NULL)
);

CREATE INDEX crp_commune_idx      ON commune_risk_profiles (commune_id);
CREATE INDEX crp_model_idx        ON commune_risk_profiles (model_version_id);
CREATE INDEX crp_source_idx       ON commune_risk_profiles (source_id);
CREATE INDEX crp_valid_from_idx   ON commune_risk_profiles (valid_from);

COMMENT ON TABLE  commune_risk_profiles IS 'Risk profile per commune per period. Source variables in 0–100 scale.';
COMMENT ON COLUMN commune_risk_profiles.valid_to      IS 'NULL means this is the currently active profile.';
COMMENT ON COLUMN commune_risk_profiles.data_quality  IS 'real | estimated | simulated — traceability of values';

-- ---------------------------------------------------------------------------
-- Table: annual_crime_indicators
-- Absolute crime counts per commune per year.
-- ---------------------------------------------------------------------------

CREATE TABLE annual_crime_indicators (
  id           uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id   uuid     NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  year         smallint NOT NULL,
  indicator    text     NOT NULL,     -- 'homicidio', 'hurto', etc.
  value        integer  NOT NULL,
  granularity  text     NOT NULL,     -- 'conteo_anual_comuna'
  source_id    uuid     REFERENCES data_sources(id),
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aci_unique_indicator UNIQUE (commune_id, year, indicator),
  CONSTRAINT aci_value_non_negative CHECK (value >= 0),
  CONSTRAINT aci_year_range         CHECK (year BETWEEN 2000 AND 2100)
);

CREATE INDEX aci_commune_idx  ON annual_crime_indicators (commune_id);
CREATE INDEX aci_year_idx     ON annual_crime_indicators (year);
CREATE INDEX aci_indicator_idx ON annual_crime_indicators (indicator);

COMMENT ON TABLE  annual_crime_indicators IS 'Absolute crime counts per commune per year. Server-side only — not exposed via RLS anon policy.';
COMMENT ON COLUMN annual_crime_indicators.indicator IS 'Crime type: homicidio, hurto, lesiones, etc.';

-- ---------------------------------------------------------------------------
-- Table: risk_time_windows
-- Risk levels by time of day. Source: homicide data by time window.
-- risk_level uses BAJO/MEDIO/ALTO to preserve source fidelity.
-- ---------------------------------------------------------------------------

CREATE TABLE risk_time_windows (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_id         text         UNIQUE NOT NULL,
  label              text         NOT NULL,
  start_time         time         NOT NULL,
  end_time           time         NOT NULL,
  homicidios_2024    integer,
  homicidios_2025    integer,
  variation_absolute integer,
  variation_pct      numeric(8,4),
  risk_score         numeric(5,2),    -- 0–10 (original source scale)
  risk_level         text         NOT NULL,
  source_id          uuid         REFERENCES data_sources(id),
  created_at         timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT rtw_risk_level_check
    CHECK (risk_level IN ('BAJO', 'MEDIO', 'ALTO')),
  CONSTRAINT rtw_homicidios_2024_check
    CHECK (homicidios_2024 IS NULL OR homicidios_2024 >= 0),
  CONSTRAINT rtw_homicidios_2025_check
    CHECK (homicidios_2025 IS NULL OR homicidios_2025 >= 0),
  CONSTRAINT rtw_risk_score_check
    CHECK (risk_score IS NULL OR risk_score BETWEEN 0 AND 10)
);

COMMENT ON TABLE  risk_time_windows IS 'Homicide counts and risk levels by time window. Scale 0–10 preserved from source.';
COMMENT ON COLUMN risk_time_windows.risk_level IS 'BAJO | MEDIO | ALTO — Spanish labels preserved from source dataset.';
COMMENT ON COLUMN risk_time_windows.end_time   IS 'May be less than start_time for windows crossing midnight (e.g., 22:00–06:00). Handle in application layer.';

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) — FUTURE
--
-- Enable AFTER all data is seeded and before exposing to the frontend.
-- Template policies shown below; uncomment and adjust as needed.
-- ---------------------------------------------------------------------------

-- ALTER TABLE data_sources            ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communes                ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE risk_model_versions     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE risk_model_coefficients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commune_risk_profiles   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE annual_crime_indicators ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE risk_time_windows       ENABLE ROW LEVEL SECURITY;

-- Public read-only (anon key) for static reference tables:
-- CREATE POLICY "anon read" ON communes             FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read" ON risk_model_versions  FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read" ON commune_risk_profiles FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read" ON risk_time_windows    FOR SELECT TO anon USING (true);

-- annual_crime_indicators — server-side only, no anon policy intentionally.
-- Access only via service role key (SUPABASE_SECRET_KEY).

-- ---------------------------------------------------------------------------
-- End of migration
-- ---------------------------------------------------------------------------
