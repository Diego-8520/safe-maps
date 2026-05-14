# Safe Maps — Pipeline de análisis de rutas

Documentación técnica del flujo completo desde la entrada del usuario hasta la visualización del riesgo acumulado.

> **Estado de datos:** geometría de comunas oficial (IDESC/QGIS). Variables de riesgo (`comunas-risk.json`) simuladas. El modelo es académico/experimental y **no representa inteligencia criminal real**.

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
         │  → OrsDirectionsResponse (geometría real de calles)
         ▼
normalizeOpenRouteResponse(orsResponse, originLabel, destLabel)
         │
         ├── segmentByDistance(coords)         tramos ~400 m (Haversine)
         ├── loadCommunesGeoJSON()              GeoJSON oficial de 22 comunas
         ├── findCommuneForPoint(midpoint)      communeId por segmento (ray-casting)
         ├── findRiskByCommune(communeId)       variables C, S, V, I, F del dataset
         └── buildRawRouteAnalysis()
         │
         ▼
calculateEulerAccumulatedRouteRisk(rawRoute, riskData)
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
  ├── MapLibreView           (ruta coloreada por accumulatedRiskLevel)
  ├── RouteSummary           (finalRiskScore, labels de origen y destino)
  ├── RouteRiskChart         (curva Euler — SVG puro)
  ├── EulerModelPanel        (fórmula y tabla de variables)
  └── RouteSegmentsPanel     (tabla por segmento, hasta 8 filas)
```

---

## 2. Contratos de datos

### `GeocodedLocation`

```ts
interface GeocodedLocation {
  label: string;         // Label resuelto por ORS (properties.label)
  coordinates: [number, number]; // [longitud, latitud]
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
4. Retorna `GeocodedLocation { label, coordinates }` donde `label = properties.label` de ORS (fallback: string enriquecido).

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
- Ruta típica en Cali: 8–15 segmentos.

---

## 6. Asignación de comuna

**Archivo:** `lib/geo/find-commune-for-point.ts` → `findCommuneForPoint(lng, lat)`

- Carga `comunas-cali.geojson` (cacheado en memoria).
- Aplica **ray-casting** (`lib/geo/point-in-polygon.ts`) por cada Feature del GeoJSON.
- Retorna `communeId` (número) o `null` si el punto cae fuera de todas las comunas.

**Fallback para `communeId = null`:**  
Se usan variables neutras `C=S=V=I=F=50`, produciendo `f ≈ +1.5` (deriva positiva conservadora, no cero).

---

## 7. Modelo de riesgo Euler

**Archivos:** `lib/risk/`

```
euler-accumulated-route-risk.ts   ← orquestación principal
build-euler-risk-input.ts         ← RouteSegment[] → EulerSegmentInput[]
euler-risk-integrator.ts          ← bucle de Euler paso a paso
risk-derivative.ts                ← función pura f(C, S, V, I, F)
risk-level.ts                     ← scoreToRiskLevel (fuente única de umbrales)
```

### Fórmula

```
R(n+1) = clamp( R(n) + f(C, S, V, I, F) · Δx_km , 0, 100 )
```

```
f(C, S, V, I, F) = 30·C̃ − 15·S̃ − 10·Ṽ − 10·Ĩ + 8·F̃
```

Donde `X̃ = X / 100` (normalización a [0, 1]).

### Condición inicial

`R(0) = localRiskScore` del primer segmento. Fallback: `R(0) = 50`.

---

## 8. División server-side / frontend

| Paso | Dónde ocurre |
|------|-------------|
| Geocodificación | Server-side (API Route) |
| Ruteo ORS | Server-side (API Route) |
| Segmentación Haversine | Server-side (API Route) |
| Asignación de comuna (ray-casting) | Server-side (API Route) |
| Riesgo local (lookup JSON) | Server-side (API Route) |
| Modelo Euler | Server-side (API Route) |
| Renderizado de mapa | Frontend (MapLibre GL JS) |
| Gráfica SVG | Frontend (React) |
| Paneles del sidebar | Frontend (React) |

La clave `OPENROUTE_API_KEY` nunca sale del servidor.

---

## 9. Errores posibles

| Error | Tipo | Código HTTP |
|-------|------|-------------|
| API key de ORS no configurada | `OrsApiKeyMissingError` | 500 |
| Dirección no encontrada por geocodificación | `OrsGeocodingError` | 422 |
| Ruta no encontrada entre los puntos | `OrsRoutingError` | 422 |
| Fallo de red al contactar ORS | `OrsNetworkError` | 503 |
| Body de request inválido | — | 400 |
| Segmento fuera de comunas | `communeId = null` | fallback neutro |

---

## 10. Archivos principales involucrados

### API layer

| Archivo | Responsabilidad |
|---------|----------------|
| `app/api/routes/analyze/route.ts` | POST handler, validación, orquestación |
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
| `lib/geo/find-commune-for-point.ts` | communeId por punto medio |
| `lib/geo/point-in-polygon.ts` | Ray-casting |
| `lib/geo/load-communes-geojson.ts` | Loader cacheado de GeoJSON |

### Riesgo

| Archivo | Responsabilidad |
|---------|----------------|
| `lib/risk/risk-derivative.ts` | Función pura `f(C,S,V,I,F)` |
| `lib/risk/euler-risk-integrator.ts` | Bucle de Euler |
| `lib/risk/build-euler-risk-input.ts` | `RouteSegment[]` → `EulerSegmentInput[]` |
| `lib/risk/euler-accumulated-route-risk.ts` | Orquestación Euler, retorna `RouteAnalysis` |
| `lib/risk/accumulated-risk.ts` | Modelo preliminar (inactivo, conservado para rollback) |
| `lib/risk/risk-level.ts` | `scoreToRiskLevel` — fuente única de umbrales |
| `lib/risk/load-communes-risk.ts` | Loader cacheado del dataset de riesgo |
| `lib/risk/find-risk-by-commune.ts` | Lookup de `CommuneRisk` por `communeId` |

### Frontend

| Archivo | Responsabilidad |
|---------|----------------|
| `components/map/map-layout.tsx` | Estado + disparo de `analyzeRoute` |
| `components/map/map-libre-view.tsx` | MapLibre GL, capa de ruta coloreada |
| `components/map/sidebar/route-summary.tsx` | Riesgo final + labels resueltos |
| `components/map/sidebar/route-risk-chart.tsx` | Gráfica SVG de curva Euler |
| `components/map/sidebar/euler-model-panel.tsx` | Fórmula + tabla de variables |
| `components/map/sidebar/route-segments-panel.tsx` | Tabla por segmento |

---

## 11. Qué se migrará a PostGIS (fase futura)

| Paso actual | Migración prevista |
|------------|-------------------|
| `loadCommunesGeoJSON()` — archivo local | Tabla `communes` en PostGIS |
| `findCommuneForPoint()` — ray-casting JS | `ST_Within` en consulta SQL |
| `loadCommunesRisk()` — JSON local | Tabla `commune_risk_profiles` en PostgreSQL |
| Sin persistencia de análisis | Tablas `route_analyses` + `route_segments` |

---

## 12. Limitaciones del pipeline actual

| Área | Limitación |
|------|-----------|
| Geocodificación | Nombres ambiguos pueden resolverse incorrectamente. Las normalizaciones cubren solo casos conocidos. |
| Datos de riesgo | `comunas-risk.json` es simulado, no proviene de datos criminales reales. |
| Asignación de comuna | Segmentos fuera de todas las comunas reciben `communeId = null` y variables neutras. |
| Segmentación | Depende de la densidad de puntos ORS; geometrías escasas producen segmentos más largos. |
| Sin autocompletado | El usuario debe ingresar direcciones suficientemente específicas para que ORS las resuelva. |
| Sin rutas alternativas | Solo se analiza la ruta más rápida. |
| Sin persistencia | Cada análisis es efímero. No se guarda en base de datos. |
| Join espacial en JS | Ray-casting correcto pero no optimizado para datasets grandes. |
