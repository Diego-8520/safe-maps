# Safe Maps Supabase Repositories

Supabase-backed repositories now exist behind a feature flag. The default runtime behavior remains local JSON/GeoJSON data.

## Feature Flag

| Variable | Values | Default |
|----------|--------|---------|
| `SAFE_MAPS_DATA_SOURCE` | `local`, `supabase` | `local` |

When `SAFE_MAPS_DATA_SOURCE` is absent or any value other than `supabase`, the repository factory returns local repositories.

```text
SAFE_MAPS_DATA_SOURCE=local
```

To test Supabase locally:

```text
SAFE_MAPS_DATA_SOURCE=supabase
SAFE_MAPS_SUPABASE_URL=https://hzvutucmigtflocalyrg.supabase.co
SAFE_MAPS_SUPABASE_SECRET_KEY=<server-side key>
SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY=<publishable key, reserved for future client use>
```

## Required Variables

Supabase repository reads are server-side and require:

| Variable | Scope | Purpose |
|----------|-------|---------|
| `SAFE_MAPS_SUPABASE_URL` | Server | Supabase project URL |
| `SAFE_MAPS_SUPABASE_SECRET_KEY` | Server only | Reads via PostgREST while RLS policies are pending |
| `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` | Reserved | Future browser/RLS-scoped access |

Do not use `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Safe Maps while there is any chance those variables point to another project.

## Repository Factory

Use:

```ts
import {
  getCommuneRepository,
  getCommuneRiskRepository,
} from "@/lib/repositories/repository-factory";
```

The factory keeps local repositories as the default:

- `SAFE_MAPS_DATA_SOURCE=supabase`: Supabase repositories
- anything else: local repositories

## Current Supabase Implementations

| Repository | Reads |
|------------|-------|
| `SupabaseCommuneRepository` | `communes` |
| `SupabaseCommuneRiskRepository` | `commune_risk_profiles` joined to `communes` via FK |

The commune repository maps database rows to the current GeoJSON `Feature` shape so the existing route pipeline can keep using the synchronous ray-casting lookup. It attempts to parse the `geometry` value returned by PostgREST as GeoJSON. If PostgREST returns a non-GeoJSON geometry representation in an environment, add a read-only view or RPC that exposes `ST_AsGeoJSON(geometry)` before enabling the Supabase data source.

## Boundaries

- UI components must not import Supabase directly.
- Supabase repositories are server-side.
- The route pipeline still defaults to local data.
- RLS is still pending; use the secret key only on the server.
- Vercel variables are not configured yet.

## Risks

- `SAFE_MAPS_SUPABASE_SECRET_KEY` bypasses RLS. Keep it server-only.
- The Supabase data source should not be enabled in shared environments until variables are verified for the Safe Maps project.
- Direct PostGIS spatial lookup is still future work; the current Supabase commune repository preserves the existing GeoJSON-based lookup contract.
