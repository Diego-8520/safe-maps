# Safe Maps — Route Risk Pipeline

Documents the current end-to-end flow from user input to the rendered accumulated-risk route.

> **Data status:** commune geometries are official (IDESC / QGIS). Risk variables (`comunas-risk.json`) are mock/simulated. The model is academic/experimental and does **not** represent real criminal intelligence.

---

## 1. Pipeline Overview

```
User enters origin + destination
         │
         ▼
analyzeRoute()          (apps/web/components/map/routes/providers/route-provider.ts)
         │
         ▼
POST /api/routes/analyze (apps/web/app/api/routes/analyze/route.ts)
         │
         ├─ geocodeAddress(origin)      ─┐
         └─ geocodeAddress(destination)  ┘  → GeocodedLocation { label, coordinates }
                                                 (openroute-client.ts — ORS Geocode API)
         │
         ▼
getDrivingRoute(originCoords, destinationCoords)
         │  → OrsDirectionsResponse (real street geometry)
         ▼
normalizeOpenRouteResponse(orsResponse, originLabel, destinationLabel)
         │
         ├─ segmentByDistance(coords)          400m chunks with Haversine overlap
         ├─ loadCommunesGeoJSON()              official 22-commune GeoJSON
         ├─ findCommuneForPoint(midpoint)      point-in-polygon per segment
         ├─ findRiskByCommune(communeId)       local risk variables from dataset
         └─ buildRawRouteAnalysis()
         │
         ▼
calculateEulerAccumulatedRouteRisk(rawRoute, riskData)
         │  riskModelVersion: euler-v1
         ├─ buildEulerRiskSegmentsFromRouteSegments()
         ├─ calculateEulerRiskEvolution(initialRiskScore, segments)
         └─ returns RouteAnalysis with accumulatedRisk* filled per segment
         │
         ▼
NextResponse.json(route)
         │
         ▼
Frontend renders:
  ├─ MapLibreView      (route coloured by accumulatedRiskLevel)
  ├─ RouteSummary      (finalRiskScore, originLabel, destinationLabel)
  ├─ RouteRiskChart    (Euler curve — SVG)
  ├─ EulerModelPanel   (formula + variable table)
  └─ RouteSegmentsPanel (per-segment table, up to 8 rows)
```

---

## 2. Data Contracts

### `RouteAnalysis`

```ts
interface RouteAnalysis {
  id: string;                        // "real-route-<timestamp>"
  originLabel: string;               // ORS-resolved geocode label
  destinationLabel: string;          // ORS-resolved geocode label
  totalDistanceMeters: number;       // rounded integer meters
  estimatedDurationMinutes: number;  // rounded integer minutes
  finalRiskScore: number;            // Euler R at last segment (0–100)
  finalRiskLevel: RouteRiskLevel;    // "low" | "medium" | "high"
  mode: "real";
  segments: RouteSegment[];
}
```

### `RouteSegment`

```ts
interface RouteSegment {
  id: string;                        // "real-seg-001", "real-seg-002", …
  coordinates: RouteCoordinate[];    // { lng, lat }[]
  distanceMeters: number;            // Haversine length of this chunk
  communeId: number | null;          // null if outside all commune polygons
  localRiskScore: number;            // from comunas-risk.json (0–100)
  localRiskLevel: RouteRiskLevel;
  accumulatedRiskScore: number;      // Euler R_n at end of this segment (1 decimal)
  accumulatedRiskLevel: RouteRiskLevel;
}
```

### Risk levels (single source of truth: `risk-level.ts`)

| Score | Level |
|-------|-------|
| < 40  | `low` |
| 40–69 | `medium` |
| ≥ 70  | `high` |

---

## 3. Euler ODE Model

### Formula

```
R_{n+1} = clamp( R_n + f(C, S, V, I, F) · Δx_km , 0, 100 )
```

### Risk derivative

```
f(C, S, V, I, F) = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃
```

Where each variable is normalised to `[0, 1]` (`X̃ = X / 100`) and the coefficients are:

| Symbol | Variable         | Direction | Coefficient |
|--------|------------------|-----------|-------------|
| C      | Criminalidad     | ↑ risk    | a = 30      |
| S      | Seguridad        | ↓ risk    | b = 15      |
| V      | Vigilancia       | ↓ risk    | d = 10      |
| I      | Iluminación      | ↓ risk    | e = 10      |
| F      | Flujo personas   | ↑ risk    | h = 8       |

### Initial condition

`R_0 = segments[0].localRiskScore` (first segment's local risk).  
If no segments exist, fallback `R_0 = 50`.

### Fallback for unknown communes

Segments with `communeId = null` use neutral variables (`C=S=V=I=F=50`), producing `f ≈ +1.5` (slight positive drift — conservative, not zero).

---

## 4. Geocoding

`geocodeAddress(address)` in `openroute-client.ts`:

1. `enrichAddress()` normalises the input — appends `", Cali, Colombia"` when missing, and hard-codes the canonical address for known ambiguous locations (e.g. `"univalle"`).
2. Calls ORS Geocode API with `boundary.country=CO` and `focus.point` biased to Cali centre.
3. Returns `GeocodedLocation { label, coordinates }` where `label = properties.label` from ORS (fallback: the enriched input string).

The resolved `label` is stored directly in `RouteAnalysis.originLabel` / `destinationLabel`, so the sidebar shows what ORS actually geocoded.

---

## 5. Segmentation

`segmentByDistance()` in `route-segmentation.ts`:

- Target chunk size: **400 m** (Haversine).
- Last coordinate of each chunk is reused as first of the next (path continuity).
- Typical urban route in Cali → 8–15 segments.
- Risk is sampled at the **midpoint** of each chunk for commune lookup.

---

## 6. Key Source Files

### API layer

| File | Responsibility |
|------|---------------|
| `apps/web/app/api/routes/analyze/route.ts` | POST handler, validation, orchestration |
| `apps/web/lib/openroute/openroute-client.ts` | geocodeAddress, getDrivingRoute |
| `apps/web/lib/openroute/openroute-types.ts` | ORS response types, GeocodedLocation |
| `apps/web/lib/openroute/openroute-errors.ts` | typed error classes |

### Route normalisation

| File | Responsibility |
|------|---------------|
| `apps/web/lib/routes/normalize-openroute-route.ts` | ORS → RouteAnalysis orchestration |
| `apps/web/lib/routes/route-segmentation.ts` | Haversine chunking |

### Geo

| File | Responsibility |
|------|---------------|
| `apps/web/lib/geo/find-commune-for-point.ts` | communeId lookup per midpoint |
| `apps/web/lib/geo/point-in-polygon.ts` | ray-casting algorithm |
| `apps/web/lib/geo/load-communes-geojson.ts` | cached GeoJSON loader |

### Risk

| File | Responsibility |
|------|---------------|
| `apps/web/lib/risk/risk-derivative.ts` | pure `f(C,S,V,I,F)` computation |
| `apps/web/lib/risk/euler-risk-integrator.ts` | Euler step loop |
| `apps/web/lib/risk/build-euler-risk-input.ts` | RouteSegment[] → EulerSegmentInput[] |
| `apps/web/lib/risk/euler-accumulated-route-risk.ts` | orchestration, returns RouteAnalysis |
| `apps/web/lib/risk/accumulated-risk.ts` | preliminary model (inactive, kept for rollback) |
| `apps/web/lib/risk/risk-level.ts` | scoreToRiskLevel — single threshold source |
| `apps/web/lib/risk/load-communes-risk.ts` | cached risk dataset loader |
| `apps/web/lib/risk/find-risk-by-commune.ts` | CommuneRisk lookup by communeId |

### Frontend

| File | Responsibility |
|------|---------------|
| `apps/web/components/map/map-layout.tsx` | state + analyzeRoute orchestration |
| `apps/web/components/map/map-libre-view.tsx` | MapLibre GL, route layer rendering |
| `apps/web/components/map/sidebar/route-summary.tsx` | final risk + resolved labels |
| `apps/web/components/map/sidebar/route-risk-chart.tsx` | SVG Euler curve chart |
| `apps/web/components/map/sidebar/euler-model-panel.tsx` | formula + variable explanation |
| `apps/web/components/map/sidebar/route-segments-panel.tsx` | per-segment table |

---

## 7. Known Limitations

| Area | Limitation |
|------|-----------|
| Geocoding | Ambiguous place names can resolve incorrectly. Hard-coded normalisations only cover known edge cases. |
| Risk data | `comunas-risk.json` is mock/simulated — not sourced from real criminal data. |
| Commune assignment | Segments outside all commune polygons get `communeId = null` and fallback variables. |
| Segmentation | Dependent on ORS geometry density; sparse geometries may produce fewer, longer segments. |
| No autocomplete | User must type exact-enough addresses for ORS to geocode correctly. |
| No alternatives | Only the single fastest driving route is analysed. |
| No persistence | No database writes. Each analysis is stateless. |
| No PostGIS | Spatial join is done client-side in JS (ray-casting). |

---

## 8. Recommended Next Steps

1. **Geocoding confidence UI** — show a warning when ORS confidence score is below a threshold.
2. **Candidate selection** — offer the top 3 geocode results and let the user confirm.
3. **Real risk data** — integrate actual crime/security indicators from official Cali sources.
4. **PostGIS / Supabase** — move spatial join server-side once frontend is stable.
5. **Alternative routes** — request up to 3 ORS alternatives and compare accumulated risk.
6. **Route text analysis** — generate a human-readable safety narrative per route.
