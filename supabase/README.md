# supabase/ — Migration and seed scaffold (NOT ACTIVE)

This directory follows the Supabase CLI convention for local development. No migrations exist yet. No connection to a Supabase project is configured.

## Structure

```
supabase/
├── migrations/   ← SQL migration files (managed by Supabase CLI)
└── seeds/        ← Seed scripts for initial data
```

## Planned migrations (not written yet)

| Migration | Description |
|-----------|-------------|
| `001_create_communes.sql` | Communes table with PostGIS geometry |
| `002_create_commune_risk_profiles.sql` | Risk indicators per commune per period |
| `003_create_risk_datasets.sql` | Registry of annual/semi-annual dataset snapshots |
| `004_enable_rls.sql` | Enable Row Level Security on all public tables |

See [docs/database-schema.md](../docs/database-schema.md) for the proposed schema.

## To initialize

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to a remote project
supabase link --project-ref <project-ref>

# Start local stack (optional, for local development)
supabase start

# Push migrations to remote
supabase db push
```

## Seeds

Seed scripts will import data from `data/processed/` into the database tables. They are not active until migrations exist and the connection is configured.

See [data/seeds/](../data/seeds/) for placeholder seed scripts.
