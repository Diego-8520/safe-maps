# Commune Risk Score Consistency — Design Spec

**Date**: 2026-05-14  
**Status**: Approved  
**Scope**: Eliminate all divergent commune risk score reads across Safe Maps

---

## Problem

A single commune X can show different `riskScore`/`riskLevel` values depending on where the user looks:

| View | Current data source |
|------|---------------------|
| Map visual layer (fill color) | `loadEnrichedGeojson()` → hardcoded `fetch('/data/comunas-risk.json')` |
| Commune hover popup | GeoJSON feature properties (from above) |
| Commune selected panel | GeoJSON feature properties (from above) |
| Route segment `localRiskScore` | `getCommuneRiskRepository().getAll()` |
| Route `initialRiskScore` (Euler) | `getCommuneRiskRepository().getAll()` |

When `SAFE_MAPS_DATA_SOURCE=supabase`, the two paths diverge. Even in local mode, they are structurally independent with no consistency guarantee.

---

## Root Cause

`loadEnrichedGeojson()` (client-side, `apps/web/components/map/data/load-communes.ts:17`) hardcodes:
```ts
fetch("/data/comunas-risk.json")
```

This bypasses `getCommuneRiskRepository()`, which is the only abstraction that respects the data source feature flag. Route normalization already uses the repository; the map does not.

---

## Solution: New API Endpoint as Single Source

Create `GET /api/communes/risk` — a Next.js API route that serves `CommuneRisk[]` through the existing repository. Change `loadEnrichedGeojson()` to call this endpoint instead of the static file.

**Invariant guaranteed post-fix:**
```
For any commune X, at any point in the app:
  GET /api/communes/risk → riskScore(X)
    === localRiskScore of any route segment whose midpoint is in X
    === initialRiskScore if the route starts in X
    === selectedCommune.riskScore in the sidebar panel
    === riskScore in the commune hover popup
    === fill-color level on the map layer
```

---

## Architecture

```
Client                              Server
  │                                   │
  ├─ loadEnrichedGeojson()            │
  │    ├─ fetch("/data/comunas-cali.geojson")  (geometry, unchanged)
  │    └─ fetch("/api/communes/risk") ────────► getCommuneRiskRepository()
  │         merge → EnrichedFeatureCollection   │  ├─ local: fs → comunas-risk.json
  │                                             │  └─ supabase: commune_risk_profiles
  │                                             │
  └─ POST /api/routes/analyze ────────────────► getCommuneRiskRepository()
       → normalizeOpenRouteResponse()           │  (same repository, same data)
          → findRiskByCommune() per segment     │
          → initialRiskScore from origin        │
```

---

## Files Changed

### New

**`apps/web/app/api/communes/risk/route.ts`**
- Handler: `GET`
- Calls `getCommuneRiskRepository().getAll()`
- Returns `NextResponse.json(data)` — type `CommuneRisk[]`, same shape as the local JSON file
- No Cache-Control (dynamic, no persistent cache by default in Next.js App Router)
- No authentication (public data, consistent with other endpoints)
- `loadEnrichedGeojson()` receives this response as `CommuneRiskData[]` (alias of `CommuneRisk`) — no deserialization change needed

### Modified

**`apps/web/components/map/data/load-communes.ts:17`**
- Change: `fetch("/data/comunas-risk.json")` → `fetch("/api/communes/risk")`
- No other changes to this file

---

## Files NOT Changed

| File | Reason |
|------|--------|
| `lib/types/commune-risk.ts` | Types already correct; `CommuneRiskData = CommuneRisk` |
| `lib/repositories/repository-factory.ts` | Already handles local/Supabase switching |
| `lib/risk/find-risk-by-commune.ts` | Pure function, no data loading |
| `lib/routes/normalize-openroute-route.ts` | Already uses repository correctly |
| `components/map/popups/commune-popup.ts` | Reads from GeoJSON feature properties — correct after fix |
| `components/map/sidebar/commune-detail.tsx` | Same — reads from feature properties |
| `app/api/routes/analyze/route.ts` | Already correct |
| `public/data/comunas-risk.json` | Still needed for local mode via repository |

---

## Error Handling

No new error handling required:
- `loadEnrichedGeojson()` already throws if `!riskRes.ok` — this propagates up to the map component
- If the new endpoint returns 500 (repository failure), `loadEnrichedGeojson()` throws, map fails to initialize — same behavior as current network errors

---

## Testing

- **Manual**: for any commune, verify `riskScore` is identical in: commune popup → commune panel → route segment `localRiskScore`
- **Endpoint**: `GET /api/communes/risk` returns valid `CommuneRisk[]` with `riskScore ∈ [0,100]` and `riskLevel ∈ {low, medium, high}` for all 22 communes
- **Existing unit tests** for `loadEnrichedGeojson()`: update mock from `/data/comunas-risk.json` to `/api/communes/risk`
- **Both modes**: verify consistency in local mode and Supabase mode

---

## Out of Scope

- Automatic sync between local JSON and Supabase (separate concern)
- Temporal filtering in Supabase repository (`valid_from`/`valid_to`)
- Risk threshold configuration (currently hardcoded at 40/70)
- HTTP caching strategy (deferred — no persistent cache for now)
