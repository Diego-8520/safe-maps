# Safe Maps — Arquitectura técnica

Descripción de la arquitectura del sistema: decisiones técnicas, estructura de carpetas, flujo de datos y separación de responsabilidades.

---

## Visión general

Safe Maps es un monorepo con un frontend Next.js que actúa también como capa de API (API Routes). El sistema consulta OpenRouteService para obtener geometría real de rutas, procesa los segmentos espacialmente, aplica el modelo de riesgo Euler y devuelve un `RouteAnalysis` completo al cliente.

Los perfiles de riesgo por comuna se sirven desde Supabase (PostgreSQL + PostGIS) cuando `SAFE_MAPS_DATA_SOURCE=supabase`, o desde archivos JSON locales si la variable no está configurada. El acceso está abstraído mediante el Repository Pattern; el pipeline de análisis no cambia con el cambio de fuente.

---

## Estructura del monorepo

```
safe-maps/
├── apps/web/                 ← Aplicación Next.js (frontend + API Routes)
├── supabase/
│   └── migrations/           ← Migraciones SQL de Supabase
├── scripts/                  ← Preparación y validación de seeds de DB
├── docs/                     ← Documentación técnica
└── README.md
```

---

## Arquitectura actual

```
Browser
  │
  ├── MapLibre GL JS (renderizado de mapa, capas, popups)
  │
  └── Next.js App Router (cliente React)
         │
         ├── GET /api/communes/risk        ← carga GeoJSON enriquecido al inicio
         │        │
         │        └── getCommuneRiskRepository().getAll()
         │                 │
         │                 ├── local: comunas-risk.json
         │                 └── supabase: commune_risk_profiles (PostgREST)
         │
         ├── POST /api/routes/analyze      ← análisis de ruta bajo demanda
         │        │
         │        ├── OpenRouteService (geocoding + routing)
         │        ├── getCommuneRepository().getFeatures()   ← ray-casting
         │        ├── getCommuneRiskRepository().getAll()    ← riesgo local
         │        └── Módulos lib/ (geo, risk/Euler, routes)
         │
         └── GET /api/health/data-source   ← diagnóstico de fuente activa
```

Todo el procesamiento de riesgo ocurre **server-side**. El cliente recibe un `RouteAnalysis` ya calculado. La clave `OPENROUTE_API_KEY` y las credenciales de Supabase nunca salen del servidor.

---

## Estructura de `apps/web`

```
apps/web/
├── app/
│   ├── api/
│   │   ├── communes/risk/route.ts          ← GET /api/communes/risk
│   │   ├── health/data-source/route.ts     ← GET /api/health/data-source
│   │   └── routes/analyze/route.ts         ← POST /api/routes/analyze
│   └── map/
│       └── page.tsx                        ← Ruta /map
│
├── components/map/
│   ├── map-layout.tsx                      ← Estado global: communesGeojson, selectedCommuneId, route
│   ├── map-libre-view.tsx                  ← Renderizado MapLibre (capas reactivas a props)
│   ├── data/load-communes.ts               ← loadEnrichedGeojson() → GET /api/communes/risk
│   ├── routes/                             ← route-types, route-utils, providers, services
│   ├── sidebar/                            ← RouteSummary, RouteRiskChart, RouteSegmentsPanel, EulerModelPanel
│   ├── popups/                             ← buildCommunePopupHtml, buildRouteSegmentPopupHtml
│   ├── analysis/                           ← Paneles de análisis de ruta
│   ├── mobile/                             ← MobileMapControls, MobileBottomSheet
│   └── ui/                                 ← Componentes visuales genéricos
│
├── lib/
│   ├── repositories/                       ← Interfaces + implementaciones local y supabase
│   ├── openroute/                          ← Cliente ORS, tipos, errores
│   ├── routes/                             ← Normalización de respuesta ORS, segmentación Haversine
│   ├── geo/                                ← Commune lookup (ray-casting), tipos GeoJSON
│   ├── risk/                               ← Modelo Euler, derivada, umbrales, config del modelo
│   ├── supabase/                           ← Cliente PostgREST, config, tipos generados
│   └── types/                              ← Tipos compartidos (CommuneRisk, modelos, tiempo)
│
└── public/data/
    ├── comunas-cali.geojson                ← Geometría oficial de comunas (IDESC)
    └── comunas-risk.json                   ← Perfiles de riesgo locales (simulados, fallback)
```

---

## Endpoints de API

| Método | Ruta | Responsabilidad |
|--------|------|----------------|
| `POST` | `/api/routes/analyze` | Geocodifica, enruta, segmenta, aplica Euler |
| `GET` | `/api/communes/risk` | Devuelve `CommuneRisk[]` desde el repository activo |
| `GET` | `/api/health/data-source` | Estado y conteo de la fuente de datos activa |

`GET /api/communes/risk` usa `force-dynamic` para no cachear; devuelve siempre datos frescos desde el repository.

---

## Flujo de datos de alto nivel

```
1. MapLayout monta → GET /api/communes/risk → communesGeojson (estado React)
2. MapLibreView recibe communesGeojson como prop → actualiza fuente MapLibre
3. Usuario hace clic en comuna → selectedCommuneId → selectedCommune derivado via useMemo(communesGeojson)
4. Usuario ingresa origen y destino → analyzeRoute()
5. POST /api/routes/analyze:
   a. geocodeAddress(origin, destination)         → coordenadas + labels
   b. getDrivingRoute(origin, dest)               → polilínea real (ORS)
   c. segmentByDistance(coords)                   → tramos ~400 m
   d. findCommuneForPoint(midpoint, features)     → communeId
   e. findRiskByCommune(communeId)                → riesgo local desde repository
   f. calculateEulerAccumulatedRouteRisk(route)   → riesgo acumulado
6. API devuelve RouteAnalysis → route (estado React)
7. Frontend renderiza mapa, puntos de segmento, gráfica, paneles
```

Ver detalle paso a paso en [docs/route-risk-pipeline.md](route-risk-pipeline.md).

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|------|----------------|
| `components/map/map-layout.tsx` | Estado global del análisis (communesGeojson, selectedCommuneId, route) |
| `components/map/map-libre-view.tsx` | Renderizado de mapa; capas reactivas a props; click y hover handlers |
| `components/map/data/load-communes.ts` | `loadEnrichedGeojson()`: combina GeoJSON + riesgo en un FeatureCollection |
| `components/map/sidebar/` | Paneles de resultados (resumen, gráfica, segmentos paginados, modelo) |
| `app/api/routes/analyze/route.ts` | Validación, orquestación server-side de análisis de ruta |
| `app/api/communes/risk/route.ts` | Fuente única de verdad del riesgo por comuna |
| `lib/repositories/` | Abstracción de fuente de datos; local o Supabase según feature flag |
| `lib/openroute/` | Comunicación con ORS (geocodificación, ruteo) |
| `lib/routes/` | Normalización de respuesta ORS, segmentación Haversine |
| `lib/geo/` | Asignación de comuna por punto (ray-casting) |
| `lib/risk/` | Derivada de riesgo, integrador Euler, umbrales, config del modelo |
| `public/data/` | Datos estáticos locales (fallback cuando `SAFE_MAPS_DATA_SOURCE=local`) |

---

## Decisiones técnicas

### ¿Por qué Next.js?
Permite tener frontend y API en el mismo proyecto sin necesidad de un backend separado. Las API Routes mantienen las claves server-side. El App Router facilita la separación entre Server Components y Client Components.

### ¿Por qué MapLibre GL JS?
Open source, compatible con fuentes de tiles libres y soporta GeoJSON nativo. No requiere licencia de Mapbox. Soporta capas reactivas mediante `setData()` sin reinicializar el mapa.

### ¿Por qué OpenRouteService?
Provee geometría real de calles con API gratuita. Soporta geocodificación con sesgo geográfico (`focus.point`). Compatible con Colombia.

### ¿Por qué el Repository Pattern?
El pipeline de análisis (`normalize-openroute-route.ts`) declara qué necesita (`getFeatures()`, `getAll()`) sin saber de dónde vienen los datos. Cambiar de JSON local a Supabase no requiere modificar el pipeline.

### ¿Por qué Euler está aislado en `lib/risk/`?
Permite reemplazar o extender el modelo sin tocar el pipeline de normalización. La fórmula de derivada y el integrador son funciones puras sin efectos laterales.

### ¿Por qué `selectedCommuneId` en lugar de `selectedCommune` en el estado?
Al guardar solo el ID en React, `selectedCommune` se deriva via `useMemo` desde `communesGeojson` (la fuente de verdad actual). Esto garantiza que el panel lateral, el popup y la capa del mapa siempre muestren el mismo valor de riesgo para cada comuna, sin snapshots stale.

### ¿Por qué `GET /api/communes/risk` con `force-dynamic`?
Para que el riesgo siempre provenga del repository activo (local o Supabase), sin que Next.js cachée la respuesta entre requests. Esto garantiza consistencia entre todos los consumidores del dato de riesgo.

---

## Seguridad

- `OPENROUTE_API_KEY` y las claves de Supabase son solo server-side.
- No se usa `NEXT_PUBLIC_*` para claves de API externas.
- El cliente nunca recibe las claves; las API Routes actúan como proxies.
- RLS activo en Supabase: el acceso de lectura pública usa la clave publicable; la clave service_role solo se usa en operaciones administrativas.
- Los componentes de UI no importan Supabase directamente.

---

## Limitaciones actuales de arquitectura

| Limitación | Impacto | Estado |
|-----------|---------|--------|
| Join espacial en JS (ray-casting) | Correcto, no optimizado para >100 comunas | Activo; PostGIS ST_Within preparado como estrategia alternativa |
| Sin persistencia de análisis | Los análisis no se guardan | Pendiente (Fase 8) |
| Sin caché de geocoding | Llamadas redundantes a ORS para las mismas direcciones | Pendiente |
| Un solo proveedor de rutas | Sin fallback si ORS falla | Pendiente |
| Sin autocompletado de direcciones | El usuario ingresa texto libre | Pendiente (Fase 5) |
