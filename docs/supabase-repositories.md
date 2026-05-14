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

To enable Supabase in a server environment:

```text
SAFE_MAPS_DATA_SOURCE=supabase
SAFE_MAPS_SUPABASE_URL=https://hzvutucmigtflocalyrg.supabase.co
SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY=<anon/public key with RLS>
SAFE_MAPS_SUPABASE_SECRET_KEY=<optional; service_role key for admin>
```

## Authentication & RLS

Row Level Security (RLS) is now active on all tables. Repositories use the following strategy:

| Key | Role | RLS | Purpose | Safe |
|-----|------|-----|---------|------|
| `PUBLISHABLE_KEY` | anon/public | Enforced | SELECT reads | Yes |
| `SECRET_KEY` | service_role | Bypassed | Admin operations | No — server-only |

**Default behavior:** Repositories use `PUBLISHABLE_KEY` for all SELECT operations, respecting RLS policies.  
**Fallback:** If `PUBLISHABLE_KEY` is not configured, the server falls back to `SECRET_KEY` if available.

## Required Variables

For Supabase to work, configure at minimum:

| Variable | Scope | Required | Purpose |
|----------|-------|----------|---------|
| `SAFE_MAPS_SUPABASE_URL` | Server | Yes | Supabase project URL |
| `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` | Server | Yes | RLS-protected reads via PostgREST |
| `SAFE_MAPS_SUPABASE_SECRET_KEY` | Server | No | Admin operations (usually not needed) |

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
| `SupabaseCommuneRepository` | `communes_geojson` |
| `SupabaseCommuneRiskRepository` | `commune_risk_profiles` joined to `communes` via FK |

The commune repository maps database rows to the current GeoJSON `Feature` shape so the existing route pipeline can keep using the synchronous ray-casting lookup.

`SupabaseCommuneRepository` intentionally reads from `public.communes_geojson`, not directly from `public.communes.geometry`. PostGIS `geometry` serialization is not a stable app contract through PostgREST, so the versioned database view exposes:

```sql
st_asgeojson(geometry)::jsonb as geometry_geojson
```

The repository consumes `geometry_geojson` as the stable GeoJSON boundary.

## Boundaries

- UI components must not import Supabase directly.
- Supabase repositories are server-side.
- The route pipeline still defaults to local data.
- RLS is active; `PUBLISHABLE_KEY` enforces row-level policies automatically.
- Vercel environment variables are not configured yet; set them before deploying.

## Risks

- `SAFE_MAPS_SUPABASE_SECRET_KEY` bypasses RLS. Keep it server-only if used.
- The Supabase data source should not be enabled in shared environments until variables are verified for the Safe Maps project.
- Direct PostGIS spatial lookup is still future work; the current Supabase commune repository preserves the existing GeoJSON-based lookup contract.
- The `communes_geojson` view is read-only app infrastructure. Keep it in sync with any future geometry column changes.

## Production Deployment

1. **Vercel:** Set `SAFE_MAPS_SUPABASE_URL` and `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` in project settings.
2. **Optional:** Set `SAFE_MAPS_SUPABASE_SECRET_KEY` only if admin operations are needed.
3. **Default:** If `SAFE_MAPS_DATA_SOURCE` is not set, the app uses local data.
4. **Enable Supabase:** Set `SAFE_MAPS_DATA_SOURCE=supabase` in Vercel environment variables when ready to switch.

```bash
# Example Vercel CLI setup
vercel env add SAFE_MAPS_DATA_SOURCE supabase
vercel env add SAFE_MAPS_SUPABASE_URL https://...supabase.co
vercel env add SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY "eyJ..."
```
