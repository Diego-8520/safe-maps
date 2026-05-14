# Safe Maps — Esquema de base de datos

Diseño definitivo de PostgreSQL + PostGIS + Supabase para Safe Maps. Este documento describe las tablas, constraints, índices, estrategia RLS y plan de migración desde los archivos locales actuales.

**Estado:** diseño aprobado, migración aún no ejecutada. Ninguna tabla existe en Supabase.

---

## Objetivos de la base de datos

1. Reemplazar los archivos locales (`comunas-cali.geojson`, `comunas-risk.json`) con tablas relacionales consultables.
2. Permitir join espacial `ST_Within` para asignar comunas a puntos GPS (reemplaza ray-casting JS).
3. Versionar el modelo de riesgo: coeficientes y variables por versión.
4. Soportar variación temporal: perfiles de riesgo por período (`valid_from / valid_to`).
5. Almacenar indicadores de criminalidad por año y comuna como fuente primaria.
6. Preparar persistencia de análisis de rutas (`route_analyses`) para fase futura.

---

## Decisiones de diseño

| Decisión | Elección | Razón |
|---------|---------|-------|
| Primary keys | UUID (`gen_random_uuid()`) | Distribución segura en entornos multi-nodo; compatibilidad con Supabase RLS |
| Geometrías | `geometry(MultiPolygon, 4326)` | WGS84 nativo, compatible con GeoJSON de IDESC |
| Indicadores de riesgo | `numeric(5,2)` en escala 0–100 | Normalización desde escala 0–10 del dataset Excel |
| Tiempo de vigencia | `valid_from / valid_to` en `commune_risk_profiles` | Permite múltiples snapshots históricos por comuna |
| Enums | `CHECK` constraints, no `TYPE ENUM` | `ALTER TYPE` en PostgreSQL requiere downtime; CHECK es más flexible |
| Índice espacial | GIST sobre `communes.geometry` | Habilita `ST_Within` eficiente |
| RLS | Por activar en fase de integración | Las tablas de datos geoespaciales serán de solo lectura pública |
| Idioma de columnas | Inglés | Consistencia con tipos TypeScript existentes |

---

## Diagrama entidad-relación

```
data_sources
    │
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
communes                        risk_model_versions
    │                                      │
    ├─────────────────┐                    │
    │                 │                    │
    ▼                 ▼                    ▼
commune_risk_profiles  annual_crime_indicators  risk_model_coefficients
    │
    └── (references risk_model_versions)

risk_time_windows
    └── (references data_sources)

── Tablas futuras (diferidas) ──
geocoded_locations
route_analyses
    └── route_segments
    └── route_alternatives
route_analysis_events
```

---

## Tablas activas

### `data_sources`

Registro de fuentes de datos utilizadas: IDESC, SecretaríaGobierno, estudios académicos.

```sql
data_sources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  source_type      text NOT NULL,     -- 'official', 'academic', 'simulated', 'estimated'
  url              text,
  description      text,
  reliability_level text,             -- 'alta', 'media', 'baja', 'simulada'
  collected_at     date,
  created_at       timestamptz NOT NULL DEFAULT now()
)
```

**Propósito:** auditoría de origen de cada dato. Referenciada desde `commune_risk_profiles`, `annual_crime_indicators` y `risk_time_windows`.

---

### `communes`

Polígonos oficiales de las 22 comunas de Cali con geometría PostGIS.

```sql
communes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id          text UNIQUE NOT NULL,         -- clave natural del Excel (ej. 'ZO001')
  comuna_numero    smallint UNIQUE NOT NULL,     -- 1–22
  name             text NOT NULL,               -- 'Comuna 1', 'Villanueva', etc.
  city             text NOT NULL DEFAULT 'Santiago de Cali',
  department       text NOT NULL DEFAULT 'Valle del Cauca',
  country          text NOT NULL DEFAULT 'Colombia',
  geometry         geometry(MultiPolygon, 4326), -- nullable hasta seed desde GeoJSON
  geometry_source  text,                         -- 'IDESC 2023', etc.
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
)

CONSTRAINTS:
  CHECK (comuna_numero BETWEEN 1 AND 22)

ÍNDICES:
  CREATE INDEX ON communes USING GIST (geometry)  -- join espacial ST_Within
  CREATE INDEX ON communes (zona_id)
  CREATE INDEX ON communes (comuna_numero)
```

**Notas:**
- `geometry` es nullable en el seed inicial. Se cargará desde `comunas-cali.geojson` (IDESC) en un paso posterior.
- El seed del Excel popula `zona_id`, `comuna_numero`, `name`. La geometría se agrega por separado.

---

### `risk_model_versions`

Versiones del modelo diferencial de riesgo. Permite comparar modelos futuros.

```sql
risk_model_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text UNIQUE NOT NULL,   -- 'euler-v1', 'euler-v2', 'logistic-v1'
  name         text NOT NULL,
  description  text,
  formula      text NOT NULL,          -- expresión legible de la fórmula
  is_active    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
)
```

---

### `risk_model_coefficients`

Coeficientes y metadatos por variable de cada versión del modelo.

```sql
risk_model_coefficients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid NOT NULL REFERENCES risk_model_versions(id) ON DELETE CASCADE,
  variable_code    text NOT NULL,           -- 'C', 'S', 'V', 'I', 'F'
  variable_name    text NOT NULL,           -- 'criminalidad', 'seguridad', etc.
  coefficient      numeric(10,4) NOT NULL,  -- 30.0, 15.0, 10.0, 10.0, 8.0
  effect_direction text NOT NULL,           -- 'increase' | 'decrease'
  created_at       timestamptz NOT NULL DEFAULT now()
)

CONSTRAINTS:
  UNIQUE (model_version_id, variable_code)
  CHECK (effect_direction IN ('increase', 'decrease'))
```

---

### `commune_risk_profiles`

Perfil de riesgo por comuna por período. Soporte de snapshots históricos.

```sql
commune_risk_profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id       uuid NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  model_version_id uuid REFERENCES risk_model_versions(id),
  valid_from       date NOT NULL,
  valid_to         date,                     -- NULL = vigente
  criminalidad     numeric(5,2) NOT NULL,   -- 0–100
  seguridad        numeric(5,2) NOT NULL,   -- 0–100
  vigilancia       numeric(5,2) NOT NULL,   -- 0–100
  iluminacion      numeric(5,2) NOT NULL,   -- 0–100
  flujo_personas   numeric(5,2) NOT NULL,   -- 0–100
  risk_score       numeric(5,2) NOT NULL,   -- 0–100 (calculado)
  risk_level       text NOT NULL,           -- 'low' | 'medium' | 'high'
  data_quality     text,                    -- 'real', 'estimated', 'simulated'
  source_id        uuid REFERENCES data_sources(id),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
)

CONSTRAINTS:
  CHECK (criminalidad   BETWEEN 0 AND 100)
  CHECK (seguridad      BETWEEN 0 AND 100)
  CHECK (vigilancia     BETWEEN 0 AND 100)
  CHECK (iluminacion    BETWEEN 0 AND 100)
  CHECK (flujo_personas BETWEEN 0 AND 100)
  CHECK (risk_score     BETWEEN 0 AND 100)
  CHECK (risk_level IN ('low', 'medium', 'high'))
  CHECK (valid_to IS NULL OR valid_to >= valid_from)
  UNIQUE (commune_id, valid_from, model_version_id)

ÍNDICES:
  CREATE INDEX ON commune_risk_profiles (commune_id)
  CREATE INDEX ON commune_risk_profiles (model_version_id)
  CREATE INDEX ON commune_risk_profiles (source_id)
  CREATE INDEX ON commune_risk_profiles (valid_from)
```

**Transformación desde Excel:** columnas `*_0_10` se multiplican × 10 para convertir a escala 0–100.

---

### `annual_crime_indicators`

Indicadores de criminalidad por año y comuna. Fuente primaria de datos observacionales.

```sql
annual_crime_indicators (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id   uuid NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  year         smallint NOT NULL,    -- 2000–2100
  indicator    text NOT NULL,        -- 'homicidio', 'hurto', etc.
  value        integer NOT NULL,     -- conteo absoluto
  granularity  text NOT NULL,        -- 'conteo_anual_comuna'
  source_id    uuid REFERENCES data_sources(id),
  created_at   timestamptz NOT NULL DEFAULT now()
)

CONSTRAINTS:
  CHECK (value >= 0)
  CHECK (year BETWEEN 2000 AND 2100)
  UNIQUE (commune_id, year, indicator)

ÍNDICES:
  CREATE INDEX ON annual_crime_indicators (commune_id)
  CREATE INDEX ON annual_crime_indicators (year)
  CREATE INDEX ON annual_crime_indicators (indicator)
```

---

### `risk_time_windows`

Ventanas horarias con indicadores de riesgo temporal. Fuente: datos de homicidios por horario.

```sql
risk_time_windows (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_id           text UNIQUE NOT NULL,    -- clave natural ('H01', 'nocturno', etc.)
  label                text NOT NULL,
  start_time           time NOT NULL,
  end_time             time NOT NULL,
  homicidios_2024      integer,
  homicidios_2025      integer,
  variation_absolute   integer,
  variation_pct        numeric(8,4),
  risk_score           numeric(5,2),            -- 0–10 (escala original del dataset)
  risk_level           text NOT NULL,           -- 'BAJO' | 'MEDIO' | 'ALTO'
  source_id            uuid REFERENCES data_sources(id),
  created_at           timestamptz NOT NULL DEFAULT now()
)

CONSTRAINTS:
  CHECK (homicidios_2024 IS NULL OR homicidios_2024 >= 0)
  CHECK (homicidios_2025 IS NULL OR homicidios_2025 >= 0)
  CHECK (risk_score IS NULL OR risk_score BETWEEN 0 AND 10)
  CHECK (risk_level IN ('BAJO', 'MEDIO', 'ALTO'))
```

**Nota:** `risk_level` usa escala en español (`BAJO/MEDIO/ALTO`) para preservar fidelidad con el dataset fuente. La conversión a `low/medium/high` del pipeline TypeScript se hace en la capa de aplicación.

---

## Tablas futuras (diferidas)

Las siguientes tablas no se crean en la migración inicial. Se documentan aquí para planificación.

| Tabla | Propósito | Fase |
|-------|-----------|------|
| `geocoded_locations` | Cache de geocodificación ORS | Fase 2 |
| `route_analyses` | RouteAnalysis persistidos | Fase 3 |
| `route_segments` | Segmentos individuales de cada análisis | Fase 3 |
| `route_alternatives` | Rutas alternativas para el mismo O/D | Fase 3 |
| `route_analysis_events` | Audit trail / telemetría de análisis | Fase 4 |

---

## Índices GiST

```sql
-- Habilita ST_Within y ST_Intersects en O(log n)
CREATE INDEX communes_geometry_gist ON communes USING GIST (geometry);
```

Sin este índice, `ST_Within` hace escaneo lineal de todos los polígonos — equivalente al ray-casting actual.

---

## Estrategia RLS

**Principio:** habilitarlo en todas las tablas antes de exponerlas al frontend.

| Tabla | Acceso público | Acceso server | RLS |
|-------|---------------|--------------|-----|
| `data_sources` | Solo lectura | Completo | `SELECT` para anon |
| `communes` | Solo lectura | Completo | `SELECT` para anon (geometría pública) |
| `risk_model_versions` | Solo lectura | Completo | `SELECT` para anon |
| `risk_model_coefficients` | Solo lectura | Completo | `SELECT` para anon |
| `commune_risk_profiles` | Solo lectura | Completo | `SELECT` para anon |
| `annual_crime_indicators` | No expuesta | Server only | Sin policy anon |
| `risk_time_windows` | Solo lectura | Completo | `SELECT` para anon |

**Futuras tablas con datos de usuario** (`route_analyses`, etc.) usarán RLS por `auth.uid()`.

---

## Riesgos y trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Geometría nula en seed inicial | Aceptable: `geometry IS NULL` permitido, se carga en paso separado |
| UUID como PK en tablas con FK | Usar `zona_id` y `code` como claves naturales en seeds para evitar lookup de UUIDs |
| `risk_time_windows.end_time < start_time` (cruce de medianoche) | Validar en capa de aplicación; PostgreSQL `time` no maneja wrapping automático |
| Caché de `commune_risk_profiles` activo | Cuando `valid_to IS NULL`, la query debe filtrar `AND valid_to IS NULL OR valid_to >= now()` |
| `annual_crime_indicators` sin RLS anon | Datos crudos de homicidios — se mantienen server-side only por prudencia |

---

## Plan de migración desde archivos locales

### Fuente 1: `comunas-cali.geojson`

```
GeoJSON features[].geometry → communes.geometry (MultiPolygon, 4326)
GeoJSON features[].properties.comuna → communes.comuna_numero
GeoJSON features[].properties.nombre → communes.name
```

**Mecanismo:** script Node.js que lea el GeoJSON y ejecute `ST_GeomFromGeoJSON()` para insertar geometrías.

### Fuente 2: `safe_maps_dataset_db_ready.xlsx`

| Hoja Excel | Tabla destino |
|-----------|--------------|
| `dim_zonas` | `communes` (zona_id, nombre) |
| `variables_modelo` | `commune_risk_profiles` (× 10 para escala 0-100) |
| `fact_homicidios_anual` | `annual_crime_indicators` |
| `dim_horarios_riesgo` | `risk_time_windows` |
| `data_sources` (opcional) | `data_sources` |

**Mecanismo:** `scripts/prepare-db-seeds.ts` lee el Excel y genera JSON procesado + SQL seeds.

### Fuente 3: Hardcoded (modelo Euler v1)

```
EULER_V1_COEFFICIENTS → risk_model_coefficients
EULER_V1_MODEL_CODE → risk_model_versions
```

**Mecanismo:** `data/seeds/002_risk_model_versions.sql` y `004_risk_model_coefficients.sql` generados por el script de seed.

---

## Orden de carga de datos

Respetar el orden de dependencias de foreign keys:

```
1. data_sources              (sin FKs entrantes de otras tablas activas)
2. risk_model_versions       (sin FKs entrantes)
3. communes                  (sin FKs entrantes; geometry=NULL en este paso)
4. risk_model_coefficients   (→ risk_model_versions)
5. commune_risk_profiles     (→ communes, risk_model_versions, data_sources)
6. annual_crime_indicators   (→ communes, data_sources)
7. risk_time_windows         (→ data_sources)
8. commune_geometries        (UPDATE communes SET geometry=...; requiere PostGIS activo)
```

**Seeds 1–7** generados por `npm run prepare-seeds` (requiere Excel en `data/raw/`).
**Seed 8** generado por `npm run prepare-geometry-seed` (lee `apps/web/public/data/comunas-cali.geojson`; no requiere Excel).

El seed 8 usa funciones PostGIS: `ST_Multi()`, `ST_SetSRID()`, `ST_GeomFromGeoJSON()`.
No aplicar sin que la migración esté activa (`CREATE EXTENSION IF NOT EXISTS postgis`).

---

## Notas éticas

- **Datos académicos:** los indicadores de riesgo actuales son valores académicos/estimados, no reportes oficiales de criminalidad.
- **Datos simulados:** `commune_risk_profiles.data_quality = 'simulated'` en los seeds iniciales. Actualizar a `'estimated'` o `'real'` cuando lleguen datos validados.
- **Sin predicción criminal:** Safe Maps no predice crímenes futuros. El `risk_score` mide condiciones de contexto, no probabilidad de delito.
- **Sin datos personales:** ninguna tabla almacena información identificable de personas.
- **Transparencia de fuente:** `source_id` en cada perfil documenta el origen. Los datos de la Secretaría de Seguridad de Cali deben citarse como fuente primaria cuando se integren.
