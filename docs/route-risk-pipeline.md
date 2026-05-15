# Safe Maps — Pipeline de análisis de rutas

Documentación técnica del flujo completo desde la entrada del usuario hasta la visualización del riesgo acumulado.

> **Estado de datos:** geometría de comunas oficial (IDESC/QGIS). Variables de riesgo desde Supabase (`commune_risk_profiles`) cuando `SAFE_MAPS_DATA_SOURCE=supabase`, o desde `comunas-risk.json` en modo local. El modelo es académico/experimental y **no representa inteligencia criminal real**.

---

## 1. Diagrama del flujo

```
Usuario ingresa origen y destino
         │
         ▼
analyzeRoute()                    (components/map/routes/providers/route-provider.ts)
         │
         ▼
POST /api/routes/analyze          (app/api/routes/analyze/route.ts)
         │
         ├── geocodeAddress(origin)      ─┐
         └── geocodeAddress(destination) ─┘  → GeocodedLocation { label, coordinates }
                                               (lib/openroute/openroute-client.ts)
         │
         ▼
getDrivingRoute(originCoords, destCoords)
         │  → polilínea real por calles (ORS)
         ▼
normalizeOpenRouteResponse(orsResponse, originLabel, destLabel)
         │
         ├── segmentByDistance(coords)         tramos ~400 m (Haversine)
         ├── getCommuneRepository().getFeatures()  GeoJSON de 22 comunas
         ├── findCommuneForPoint(midpoint)     communeId por segmento (ray-casting)
         ├── findRiskByCommune(communeId)      variables C, S, V, I, F desde repository
         └── buildRawRouteAnalysis()
         │
         ▼
calculateEulerAccumulatedRouteRisk(rawRoute)
         │  riskModelVersion: euler-v1
         ├── buildEulerRiskSegmentsFromRouteSegments()
         ├── calculateEulerRiskEvolution(R0, segments)
         └── retorna RouteAnalysis con accumulatedRisk* por segmento
         │
         ▼
NextResponse.json(route)
         │
         ▼
Frontend renderiza:
  ├── MapLibreView           (ruta coloreada por localRiskLevel; puntos de segmento)
  ├── RouteSummary           (finalRiskScore, labels de origen y destino)
  ├── RouteRiskChart         (curva Euler — SVG puro)
  ├── EulerModelPanel        (fórmula y tabla de variables)
  └── RouteSegmentsPanel     (tabla paginada por segmento, 8 por página)
```

---

## 2. Contratos de datos

### `GeocodedLocation`

```ts
interface GeocodedLocation {
  label: string;                  // Label resuelto por ORS (properties.label)
  coordinates: [number, number];  // [longitud, latitud]
}
```

### `RouteAnalysis`

```ts
interface RouteAnalysis {
  id: string;                        // "real-route-<timestamp>"
  originLabel: string;               // Label resuelto por ORS
  destinationLabel: string;          // Label resuelto por ORS
  totalDistanceMeters: number;       // Metros totales (entero)
  estimatedDurationMinutes: number;  // Minutos estimados (entero)
  initialRiskScore: number;          // R(0), riesgo de la comuna del punto de origen
  initialRiskLevel: RouteRiskLevel;  // Nivel de R(0)
  finalRiskScore: number;            // R de Euler al último segmento (0–100)
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
  distanceMeters: number;            // Longitud Haversine del tramo
  communeId: number | null;          // null si está fuera de todas las comunas
  localRiskScore: number;            // Puntuación local de la comuna (0–100)
  localRiskLevel: RouteRiskLevel;
  accumulatedRiskScore: number;      // R(n) al final del segmento (1 decimal)
  accumulatedRiskLevel: RouteRiskLevel;
}
```

### Umbrales de clasificación (fuente única)

| Puntuación | Nivel |
|-----------|-------|
| < 40 | `low` |
| 40–69 | `medium` |
| ≥ 70 | `high` |

Definidos en `apps/web/lib/risk/risk-level.ts` → `scoreToRiskLevel()`.

---

## 3. Geocodificación

**Archivo:** `lib/openroute/openroute-client.ts` → `geocodeAddress(address)`

1. `enrichAddress()` normaliza la entrada:
   - Si no contiene `"Cali"` ni `"Colombia"`, agrega `", Cali, Colombia"`.
   - Resuelve alias conocidos (ej. `"univalle"` → dirección canónica).
2. Llama a ORS Geocode API con `boundary.country=CO` y `focus.point` centrado en Cali.
3. Si no hay resultados: lanza `OrsGeocodingError`.
4. Retorna `GeocodedLocation { label, coordinates }` donde `label = properties.label` de ORS.

El `label` resuelto se almacena en `RouteAnalysis.originLabel` y `destinationLabel` y se muestra en el sidebar.

---

## 4. Ruteo

**Archivo:** `lib/openroute/openroute-client.ts` → `getDrivingRoute(originCoords, destCoords)`

- Llama a ORS Directions API (perfil `driving-car`).
- Retorna `OrsDirectionsResponse` con geometría de la ruta en formato GeoJSON LineString.
- Si ORS retorna error: lanza `OrsRoutingError`.

---

## 5. Segmentación

**Archivo:** `lib/routes/route-segmentation.ts` → `segmentByDistance(coords)`

- Tamaño objetivo de cada tramo: **400 m** (Haversine).
- El último punto de cada tramo se reutiliza como primer punto del siguiente (continuidad).
- El riesgo se evalúa en el **punto medio** de cada tramo para la búsqueda de comuna.
- Ruta típica en Cali: 8–25 segmentos dependiendo de la distancia.

---

## 6. Asignación de comuna

**Archivo:** `lib/geo/find-commune-for-point.ts` → `findCommuneForPoint(point, features)`

- Recibe `CommuneFeature[]` desde `getCommuneRepository().getFeatures()`.
- Aplica **ray-casting** (`lib/geo/spatial/ray-casting-commune-lookup.ts`) por cada Feature.
- Retorna `communeId` (número 1–22) o `null` si el punto cae fuera de todas las comunas.

**Fallback para `communeId = null`:**
Se usa `localRiskScore = 50` como valor neutro. El acumulado Euler evoluciona gradualmente hacia ese valor durante el tramo.

---

## 7. Fuente de riesgo local

**Archivo:** `lib/risk/find-risk-by-commune.ts` → `findRiskByCommune(communeId, risks)`

- Recibe `CommuneRisk[]` desde `getCommuneRiskRepository().getAll()`.
- Retorna `{ localRiskScore, localRiskLevel }` para el communeId dado.
- Fallback: `localRiskScore = 50`, `localRiskLevel = "medium"` si la comuna no está en el dataset.

La fuente activa (local o Supabase) depende de `SAFE_MAPS_DATA_SOURCE`.

---

## 8. Modelo de riesgo Euler

**Archivos:** `lib/risk/`

```
euler-accumulated-route-risk.ts   ← orquestación principal
build-euler-risk-input.ts         ← RouteSegment[] → EulerSegmentInput[]
euler-risk-integrator.ts          ← bucle de Euler paso a paso
risk-derivative.ts                ← modelo lineal histórico (conservado para comparación)
risk-level.ts                     ← scoreToRiskLevel (fuente única de umbrales)
```

### Fórmula del integrador activo

```
R(n+1) = clamp( R(n) + k · (localRiskScore − R(n)) · Δx_km , 0, 100 )
```

Donde `k = 1` (Euler v1). El acumulado se mueve gradualmente hacia el riesgo local del segmento actual.

### Condición inicial

`R(0) = initialRiskScore`: riesgo de la comuna donde cae el primer punto real de la ruta (`geometry.coordinates[0]`). Esto evita depender del punto medio del primer segmento, que puede caer en otra comuna. Fallback: primer `localRiskScore` disponible, o `50` si no hay segmentos.

---

## 9. Visualización en el frontend

### Capas del mapa (MapLibre)

| Capa | Fuente | Estilo |
|------|--------|--------|
| `comunas-fill` | `communesGeojson` (prop) | Relleno coloreado por `riskLevel` |
| `comunas-outline` | `communesGeojson` (prop) | Borde negro delgado |
| `selected-commune-outline` | `communesGeojson` (prop) | Borde blanco al seleccionar |
| `route-line` | `buildRouteGeoJson(route)` | Línea coloreada por `localRiskLevel` del segmento |
| `route-segment-points` | `buildRouteSegmentPointsGeoJson(route)` | Puntos blancos en inicio y fin de segmento |

### Panel de segmentos

`RouteSegmentsPanel` muestra los segmentos paginados (8 por página) con columnas:
- `#`: número de segmento (continuo entre páginas)
- `dist`: longitud en km
- `com`: communeId (`C16`, `C8`, etc.) o `–` si es null
- `local`: `localRiskScore` con punto de color
- `acum.`: `accumulatedRiskScore` con punto de color

La página se reinicia al cambiar la ruta (detección por longitud de `segments`).

---

## 10. División server-side / frontend

| Paso | Dónde ocurre |
|------|-------------|
| Geocodificación | Server-side (API Route) |
| Ruteo ORS | Server-side (API Route) |
| Segmentación Haversine | Server-side (API Route) |
| Asignación de comuna (ray-casting) | Server-side (API Route) |
| Riesgo local (repository) | Server-side (API Route) |
| Modelo Euler | Server-side (API Route) |
| Carga de GeoJSON enriquecido | Server-side (`GET /api/communes/risk`) + cliente (`fetch`) |
| Renderizado de mapa | Frontend (MapLibre GL JS) |
| Gráfica SVG | Frontend (React) |
| Paneles del sidebar | Frontend (React) |

La clave `OPENROUTE_API_KEY` y las credenciales de Supabase nunca salen del servidor.

---

## 11. Errores posibles

| Error | Tipo | Código HTTP |
|-------|------|-------------|
| API key de ORS no configurada | `OrsApiKeyMissingError` | 500 |
| Dirección no encontrada | `OrsGeocodingError` | 422 |
| Ruta no encontrada entre los puntos | `OrsRoutingError` | 422 |
| Fallo de red al contactar ORS | `OrsNetworkError` | 503 |
| Body de request inválido | — | 400 |
| Segmento fuera de comunas | `communeId = null` | fallback neutro (score = 50) |
| Error en repository de riesgo | — | 500 (en `GET /api/communes/risk`) |

---

## 12. Archivos principales involucrados

### API layer

| Archivo | Responsabilidad |
|---------|----------------|
| `app/api/routes/analyze/route.ts` | POST handler, validación, orquestación |
| `app/api/communes/risk/route.ts` | GET handler, fuente única de riesgo |
| `lib/openroute/openroute-client.ts` | `geocodeAddress`, `getDrivingRoute` |
| `lib/openroute/openroute-types.ts` | Tipos ORS, `GeocodedLocation` |
| `lib/openroute/openroute-errors.ts` | Clases de error tipadas |

### Normalización de ruta

| Archivo | Responsabilidad |
|---------|----------------|
| `lib/routes/normalize-openroute-route.ts` | ORS → RouteAnalysis (orquestación) |
| `lib/routes/route-segmentation.ts` | Segmentación Haversine |

### Geo

| Archivo | Responsabilidad |
|---------|----------------|
| `lib/geo/find-commune-for-point.ts` | communeId por punto medio (façade sobre estrategia) |
| `lib/geo/spatial/ray-casting-commune-lookup.ts` | Ray-casting encapsulado |
| `lib/geo/load-communes-geojson.ts` | Loader cacheado de GeoJSON local |

### Repositories

| Archivo | Responsabilidad |
|---------|----------------|
| `lib/repositories/repository-factory.ts` | Selección de implementación según feature flag |
| `lib/repositories/supabase-commune-risk-repository.ts` | Riesgo desde Supabase (activo) |
| `lib/repositories/local-commune-risk-repository.ts` | Riesgo desde JSON local (fallback) |

### Riesgo

| Archivo | Responsabilidad |
|---------|----------------|
| `lib/risk/euler-risk-integrator.ts` | Bucle de Euler |
| `lib/risk/build-euler-risk-input.ts` | `RouteSegment[]` → `EulerSegmentInput[]` |
| `lib/risk/euler-accumulated-route-risk.ts` | Orquestación Euler, retorna `RouteAnalysis` |
| `lib/risk/risk-derivative.ts` | Modelo lineal histórico (conservado, inactivo en pipeline) |
| `lib/risk/risk-level.ts` | `scoreToRiskLevel` — fuente única de umbrales |
| `lib/risk/find-risk-by-commune.ts` | Lookup de `CommuneRisk` por `communeId` |

### Frontend

| Archivo | Responsabilidad |
|---------|----------------|
| `components/map/map-layout.tsx` | Estado + carga de GeoJSON + disparo de `analyzeRoute` |
| `components/map/map-libre-view.tsx` | MapLibre GL, todas las capas reactivas a props |
| `components/map/data/load-communes.ts` | `loadEnrichedGeojson()`: GeoJSON + riesgo en una sola estructura |
| `components/map/routes/route-utils.ts` | `buildRouteGeoJson`, `buildRouteSegmentPointsGeoJson` |
| `components/map/sidebar/route-summary.tsx` | Riesgo final + labels resueltos |
| `components/map/sidebar/route-risk-chart.tsx` | Gráfica SVG de curva Euler |
| `components/map/sidebar/euler-model-panel.tsx` | Fórmula + tabla de variables |
| `components/map/sidebar/route-segments-panel.tsx` | Tabla paginada por segmento |

---

## 13. Limitaciones del pipeline actual

| Área | Limitación |
|------|-----------|
| Geocodificación | Nombres ambiguos pueden resolverse incorrectamente. Las normalizaciones cubren solo casos conocidos. |
| Datos de riesgo | Los perfiles actuales son simulados. No provienen de datos criminales reales. |
| Asignación de comuna | Segmentos fuera de todas las comunas reciben `communeId = null` y score neutro de 50. |
| Segmentación | Depende de la densidad de puntos ORS; geometrías escasas producen segmentos más largos. |
| Sin autocompletado | El usuario debe ingresar direcciones suficientemente específicas. |
| Sin rutas alternativas | Solo se analiza la ruta más rápida (perfil driving-car). |
| Sin persistencia | Cada análisis es efímero. No se guarda en base de datos. |
| Ray-casting en JS | Correcto para 22 comunas, no optimizado para datasets más grandes. |
