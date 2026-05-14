# Safe Maps — Arquitectura técnica

Descripción de la arquitectura general del sistema: decisiones técnicas, estructura de carpetas, flujo de datos y evolución esperada.

---

## Visión general

Safe Maps es un monorepo con un frontend Next.js que actúa también como capa de API (API Routes). El sistema consulta OpenRouteService para obtener geometría real de rutas, procesa los segmentos espacialmente y aplica el modelo de riesgo Euler antes de enviar la respuesta al cliente.

En fases futuras, la lógica de persistencia y los joins espaciales se moverán a una base de datos PostgreSQL con PostGIS (Supabase).

---

## Estructura del monorepo

```
safe-maps/
├── apps/
│   ├── web/                  ← Aplicación Next.js principal (actual)
│   └── api/                  ← API dedicada (fase futura, opcional)
│
├── data/
│   ├── raw/                  ← Datos originales sin procesar
│   ├── processed/            ← Datos transformados y listos para uso
│   └── seeds/                ← Scripts de seed para base de datos
│
├── docs/                     ← Documentación del proyecto
└── README.md
```

---

## Arquitectura actual

```
Browser
  │
  ├── MapLibre GL JS (renderizado de mapa)
  │
  └── Next.js App Router (cliente)
         │
         └── POST /api/routes/analyze   ← Next.js API Route (server-side)
                │
                ├── OpenRouteService (geocoding + routing)
                ├── comunas-cali.geojson (local, en memoria)
                ├── comunas-risk.json   (local, en memoria)
                └── Módulos lib/ (geo, risk, routes)
```

Todo el procesamiento ocurre **server-side**. El cliente recibe un `RouteAnalysis` ya calculado.

---

## Arquitectura objetivo (fase futura)

```
Browser
  │
  └── Next.js App Router (cliente)
         │
         └── POST /api/routes/analyze
                │
                ├── OpenRouteService (geocoding + routing)
                ├── Supabase / PostGIS (join espacial, comunas)
                ├── Supabase / PostgreSQL (perfiles de riesgo)
                └── Módulos lib/ (Euler, normalización)
```

La geometría de comunas y los perfiles de riesgo se consultarán desde la base de datos en lugar de archivos estáticos locales.

---

## Estructura de `apps/web`

```
apps/web/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── analyze/
│   │           └── route.ts          ← POST handler principal
│   └── map/
│       └── page.tsx                  ← Ruta /map
│
├── components/
│   └── map/
│       ├── map-layout.tsx            ← Estado central + orquestación
│       ├── map-libre-view.tsx        ← Renderizado MapLibre
│       ├── routes/                   ← Tipos, proveedor, utilidades
│       ├── sidebar/                  ← Componentes del panel lateral
│       └── ui/                       ← Íconos y utilidades visuales
│
├── lib/
│   ├── openroute/                    ← Cliente ORS, tipos, errores
│   ├── routes/                       ← Normalización y segmentación
│   ├── geo/                          ← Commune lookup, ray-casting
│   └── risk/                         ← Modelo Euler, derivada, umbrales
│
└── public/
    └── data/
        ├── comunas-cali.geojson      ← Geometría oficial
        └── comunas-risk.json         ← Dataset de riesgo (simulado)
```

---

## Flujo de datos de alto nivel

```
1. Usuario ingresa origen y destino
2. Frontend llama analyzeRoute()
3. API Route recibe POST con { origin, destination }
4. geocodeAddress() → coordenadas + label resuelto (ORS)
5. getDrivingRoute() → polilínea real por calles (ORS)
6. normalizeOpenRouteResponse() → segmentación + commune lookup + riesgo local
7. calculateEulerAccumulatedRouteRisk() → riesgo acumulado por segmento
8. API devuelve RouteAnalysis
9. Frontend renderiza mapa, gráfica y paneles
```

Ver detalle paso a paso en [docs/route-risk-pipeline.md](route-risk-pipeline.md).

---

## Separación de responsabilidades

| Capa | Responsabilidad |
|------|----------------|
| `components/map/map-layout.tsx` | Estado global del análisis, dispara `analyzeRoute` |
| `components/map/map-libre-view.tsx` | Renderizado de mapa y capa de ruta coloreada |
| `components/map/sidebar/` | Paneles de resultados (resumen, gráfica, segmentos, modelo) |
| `app/api/routes/analyze/route.ts` | Validación, orquestación server-side |
| `lib/openroute/` | Comunicación con ORS (geocodificación, ruteo) |
| `lib/routes/` | Normalización de respuesta ORS, segmentación Haversine |
| `lib/geo/` | Asignación de comuna por punto (ray-casting) |
| `lib/risk/` | Derivada de riesgo, integrador Euler, umbrales |
| `public/data/` | Datos estáticos locales (GeoJSON, JSON de riesgo) |

---

## Decisiones técnicas

### ¿Por qué Next.js?
Permite tener frontend y API en el mismo proyecto sin necesidad de un backend separado en esta fase. Las API Routes mantienen las claves server-side.

### ¿Por qué MapLibre GL JS?
Es open source, compatible con fuentes de tiles libres y soporta GeoJSON nativo. No requiere licencia de Mapbox.

### ¿Por qué OpenRouteService?
Provee geometría real de calles con API gratuita. Soporta geocodificación y múltiples perfiles de transporte. Compatible con Colombia.

### ¿Por qué Euler está aislado en `lib/risk/`?
Permite reemplazar o extender el modelo sin tocar el pipeline de normalización. La derivada `f(C,S,V,I,F)` y el integrador son funciones puras.

### ¿Por qué PostGIS en fase futura?
El join espacial actual (ray-casting JS) es correcto para el volumen actual. PostGIS permitirá escalar, cachear resultados y hacer queries geoespaciales eficientes cuando el dataset crezca.

---

## Seguridad

- `OPENROUTE_API_KEY` vive en variables de entorno server-side únicamente.
- No se usa `NEXT_PUBLIC_*` para claves de API externas.
- El cliente nunca recibe la clave; la API Route actúa como proxy.
- En fase futura, Supabase usará Row Level Security (RLS) para proteger datos persistidos.

---

## Limitaciones actuales de arquitectura

| Limitación | Impacto | Solución futura |
|-----------|---------|----------------|
| GeoJSON en memoria (archivos locales) | No escala a datasets grandes | Migrar a PostGIS |
| Sin persistencia | Los análisis no se guardan | Supabase + tablas de análisis |
| Join espacial en JS (ray-casting) | Correcto pero no optimizado | PostGIS ST_Within |
| Sin caché de geocoding | Llamadas redundantes a ORS | Cache server-side o DB |
| Un solo proveedor de rutas | Sin fallback si ORS falla | Diseñar abstracción de proveedor |
