# lib/supabase — Safe Maps Supabase Boundary

This directory contains Safe Maps-specific Supabase configuration and server-side REST access. Runtime still defaults to local JSON files unless `SAFE_MAPS_DATA_SOURCE=supabase`.

## Files

| File | Purpose |
|------|---------|
| `config.ts` | Safe Maps data source flag and Supabase env helpers |
| `database.types.ts` | Generated types from the public Supabase schema |
| `types.ts` | Re-exports generated database types |
| `client.ts` | Browser config placeholder; no browser client is created |
| `server.ts` | Server-side PostgREST client used by Supabase repositories |

## Feature flag

```text
SAFE_MAPS_DATA_SOURCE=local
```

The default is local when the variable is absent. Set `SAFE_MAPS_DATA_SOURCE=supabase` only in a verified server environment.

## Variables

```text
SAFE_MAPS_SUPABASE_URL=
SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY=
SAFE_MAPS_SUPABASE_SECRET_KEY=
```

Avoid `NEXT_PUBLIC_SUPABASE_*` for Safe Maps while another project may define those variables in the same environment.

| Key | Variable | Scope | RLS |
|-----|---------|-------|-----|
| Publishable (anon) | `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` | Reserved for future browser use | Enforced |
| Secret (service role) | `SAFE_MAPS_SUPABASE_SECRET_KEY` | Server only | **Bypassed** |

The secret key bypasses Row Level Security entirely. Use it only in server-side code. Never expose it to the browser.

## RLS requirement

When tables become public-facing, RLS policies are mandatory. A table without RLS and a publishable key is effectively world-readable and writable. Enable RLS on every table before exposing it.

## Migration to Supabase repositories

The active repository is selected by `lib/repositories/repository-factory.ts`. UI code should not import Supabase directly.

See [docs/repositories.md](../../../../docs/repositories.md) and [docs/data-architecture.md](../../../../docs/data-architecture.md).
