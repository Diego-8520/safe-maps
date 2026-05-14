# Safe Maps — Database Execution Status

**Updated:** 2026-05-14  
**Supabase project ref:** `hzvutucmigtflocalyrg`  
**Supabase dashboard:** https://supabase.com/dashboard/project/hzvutucmigtflocalyrg

This document records the remote database execution status for the Safe Maps Supabase project. It does not include secrets.

## Execution Summary

| Item | Status |
|------|--------|
| Initial migration applied | Yes |
| Required extensions active | Yes: `pgcrypto`, `postgis` |
| Seeds 001-007 applied | Yes |
| Seed 008 geometries applied | Yes |
| Runtime pipeline changed | No |
| App connected to Supabase | No |
| RLS policies implemented | Pending |

## Final Table Counts

| Table | Count |
|-------|------:|
| `data_sources` | 1 |
| `risk_model_versions` | 1 |
| `communes` | 22 |
| `risk_model_coefficients` | 5 |
| `commune_risk_profiles` | 22 |
| `annual_crime_indicators` | 44 |
| `risk_time_windows` | 8 |

## Geometry Status

| Metric | Count |
|--------|------:|
| Total communes | 22 |
| With geometry | 22 |
| Without geometry | 0 |
| Valid geometries | 22 |
| Invalid geometries | 0 |
| Null geometries | 0 |

Seed 008 was completed by updating only communes whose geometry was null or invalid:

`1`, `2`, `3`, `7`, `18`, `19`, `20`, `21`

The update used PostGIS geometry loading from local GeoJSON:

```sql
ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('<geojson>'), 4326))
```

`geometry_source` was set to `IDESC/QGIS GeoJSON EPSG:4326`.

## Validation Queries

Final validation completed successfully:

| Check | Result |
|-------|--------|
| Table counts | Match expected counts |
| Geometry summary | 22 present, 0 missing |
| `ST_IsValid` summary | 22 valid, 0 invalid |
| Euler coefficients | `C=30`, `S=15`, `V=10`, `I=10`, `F=8` |
| Commune risk profiles | 22 joined profiles |
| Annual indicators | 22 rows for 2024, 22 rows for 2025 |
| Spatial containment query | Succeeded; sample point returned `Comuna 3` |

Annual indicator totals:

| Year | Rows | Total value |
|------|-----:|------------:|
| 2024 | 22 | 903 |
| 2025 | 22 | 1026 |

## Staging Tables

No accidental public staging tables were found:

```text
public tables matching '_%' = 0
```

No staging tables needed deletion.

## Notes

- The app still uses local runtime data.
- The app is intentionally not connected to Supabase yet.
- No UI or route pipeline changes were made.
- Supabase CLI local state is ignored via `supabase/.temp/`.

## Next Steps

1. Define and activate concrete RLS policies.
2. Generate TypeScript types from Supabase.
3. Create Supabase repository implementations.
4. Add a feature flag to switch reads from local data to DB data.
5. Configure Vercel variables specifically for Safe Maps.
6. Do not connect the app while variables may still point to another project.
