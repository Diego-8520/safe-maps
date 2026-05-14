# supabase/ — Migration and seed scaffold

Follows Supabase CLI convention. Migration exists as a draft; no Supabase project is linked yet.

## Structure

```
supabase/
├── migrations/
│   └── 20260514_initial_schema.sql   ← Full DDL draft (NOT applied)
└── seeds/                             ← Placeholder (seeds live in data/seeds/)
```

## Migration status

| File | Status | Description |
|------|--------|-------------|
| `20260514_initial_schema.sql` | DRAFT — not applied | 7 tables, PostGIS, GiST index, RLS templates |

## Seed execution order

After the migration is applied, run seeds **in this exact order**:

```
001_data_sources.sql          — no FK dependencies
002_risk_model_versions.sql   — no FK dependencies
003_communes.sql              — inserts rows, geometry=NULL
004_risk_model_coefficients.sql — → risk_model_versions
005_commune_risk_profiles.sql — → communes, risk_model_versions
006_annual_crime_indicators.sql — → communes
007_risk_time_windows.sql     — → data_sources
008_commune_geometries.sql    — UPDATEs communes.geometry (PostGIS required)
```

See [data/seeds/README.md](../data/seeds/README.md) for full details.

## PostGIS requirement

Seed 008 uses PostGIS functions (`ST_Multi`, `ST_SetSRID`, `ST_GeomFromGeoJSON`).
The migration activates PostGIS via `CREATE EXTENSION IF NOT EXISTS postgis;`.
Do not apply 008 without the migration.

## To initialize (when ready)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to a remote project
supabase link --project-ref <project-ref>

# Apply migration
supabase db push
# or: supabase db execute --file supabase/migrations/20260514_initial_schema.sql

# Apply seeds in order (see data/seeds/README.md)
```

## Row Level Security

RLS is enabled on all tables in the migration but no policies are active yet.
All read access is blocked until policies are defined.
See `docs/database-schema.md` for the planned policy strategy.

See [docs/database-schema.md](../docs/database-schema.md) for full schema documentation.
