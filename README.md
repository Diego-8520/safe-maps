# Safe Maps

Plataforma web académica de análisis urbano y riesgo geoespacial para Santiago de Cali, Colombia.

---

## ¿Qué es Safe Maps?

Safe Maps es un proyecto académico que modela cómo evoluciona el riesgo urbano a lo largo de una ruta de desplazamiento. Calcula rutas reales usando OpenRouteService, divide cada ruta en segmentos de ~400 m, detecta por qué comuna pasa cada segmento y aplica un modelo diferencial (método de Euler) para estimar cómo el riesgo se acumula gradualmente.

**No es** un reemplazo de Google Maps, Waze ni ningún sistema de navegación GPS.  
**No es** una herramienta de predicción criminal, un sistema policial ni una plataforma de inteligencia de seguridad.  
**Es** una demostración técnica/académica de cómo integrar análisis geoespacial, modelos matemáticos diferenciales y visualización interactiva aplicados a un problema urbano real.

> **Disclaimer ético:** Los datos de riesgo actuales son simulados. El modelo es experimental. Ningún resultado debe interpretarse como predicción real de seguridad urbana. La plataforma no estigmatiza zonas ni personas.

---

## Características actuales

- **Mapa interactivo** con MapLibre GL JS: comunas de Cali coloreadas por nivel de riesgo local
- **Rutas reales por calles** vía OpenRouteService (perfil driving-car)
- **Geocodificación** de origen y destino con sesgo hacia Cali
- **Segmentación Haversine**: cada ruta se divide en tramos de ~400 m
- **Detección de comuna** por segmento mediante ray-casting sobre los polígonos GeoJSON oficiales
- **Riesgo local por segmento**: puntuación 0–100 de la comuna correspondiente
- **Modelo Euler v1**: riesgo acumulado calculado segmento a segmento
- **Ruta coloreada** por nivel de riesgo local del tramo (bajo / medio / alto)
- **Puntos de inicio y fin** de cada segmento visualizados sobre el mapa
- **Panel lateral** con resumen de la ruta, etiquetas resueltas de ORS y riesgo final
- **Gráfica SVG** de la curva de evolución de riesgo Euler
- **Panel del modelo diferencial** con fórmula y tabla de coeficientes
- **Panel de segmentos paginado** (8 segmentos por página, navegación con ‹ / ›)
- **Popup por comuna** al pasar el cursor (riesgo local, variables)
- **Popup por segmento** al pasar el cursor sobre la ruta (riesgo local y acumulado)
- **Selección de comuna**: panel lateral con detalle de la comuna al hacer clic
- **Integración Supabase**: perfiles de riesgo almacenados en PostgreSQL + PostGIS
- **Feature flag** `SAFE_MAPS_DATA_SOURCE`: alterna entre datos locales y Supabase sin cambiar código
- **Endpoint de riesgo** `GET /api/communes/risk`: fuente única de verdad del riesgo por comuna
- **Endpoint de salud** `GET /api/health/data-source`: verifica conectividad y cantidad de datos cargados

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 App Router + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Mapa | MapLibre GL JS v5 |
| API | Next.js API Routes (server-side, Node.js) |
| Routing | OpenRouteService (geocodificación + perfil driving-car) |
| Base de datos | Supabase (PostgreSQL + PostGIS) |
| GeoJSON oficial | IDESC — Infraestructura de Datos Espaciales de Santiago de Cali |
| Deploy | Vercel |

---

## Arquitectura

### Repository Pattern

El acceso a datos está abstraído en dos interfaces:

```
CommuneRepository          → getFeatures(): Promise<CommuneFeature[]>
CommuneRiskRepository      → getAll(): Promise<CommuneRisk[]>
```

La función `getCommuneRiskRepository()` en `repository-factory.ts` selecciona la implementación según `SAFE_MAPS_DATA_SOURCE`:

- `local` → lee `comunas-risk.json` desde el sistema de archivos
- `supabase` → consulta `commune_risk_profiles` en Supabase vía PostgREST

El pipeline de análisis de rutas (`normalize-openroute-route.ts`) importa solo los singletons de repository y no sabe ni le importa de dónde vienen los datos.

### Fuente única de verdad del riesgo

Todos los consumers (mapa, panel lateral, segmentos, Euler) obtienen los datos de riesgo por la misma ruta:

```
getCommuneRiskRepository().getAll()
        ↓
GET /api/communes/risk          ← consumido por loadEnrichedGeojson()
        ↓
communesGeojson (estado React en MapLayout)
        ↓
MapLibreView  →  fuente de la capa del mapa
selectedCommune (useMemo)  →  panel lateral
RouteAnalysis.segments  →  riesgo local por segmento
```

### Flujo de datos completo

```
Usuario ingresa origen y destino
         │
         ▼
analyzeRoute()   →   POST /api/routes/analyze
         │
         ├── geocodeAddress(origin, destination)   → coordenadas + labels resueltos (ORS)
         ├── getDrivingRoute()                     → polilínea real por calles (ORS)
         ├── segmentByDistance()                   → tramos ~400 m (Haversine)
         ├── findCommuneForPoint(midpoint)         → communeId por segmento (ray-casting)
         ├── findRiskByCommune(communeId)          → riesgo local desde repository
         └── calculateEulerAccumulatedRouteRisk()  → R acumulado por segmento
                          ↓
               Frontend renderiza:
               - Ruta coloreada por riesgo local
               - Puntos de inicio/fin de segmentos
               - Gráfica Euler (SVG)
               - Panel de segmentos paginado
               - Panel del modelo diferencial
```

---

## Modelo matemático

El riesgo acumulado R evoluciona hacia el riesgo local del segmento actual mediante el método de Euler:

```
R(n+1) = clamp( R(n) + k · (localRiskScore − R(n)) · Δx_km , 0, 100 )
```

| Símbolo | Significado |
|---------|------------|
| `R(n)` | Riesgo acumulado al inicio del segmento n |
| `localRiskScore` | Puntuación de riesgo de la comuna del segmento (0–100) |
| `k = 1` | Sensibilidad de ajuste (Euler v1) |
| `Δx_km` | Longitud del segmento en kilómetros |
| `R(0)` | Riesgo de la comuna del punto de origen |

**Interpretación:** si la ruta pasa por una zona de riesgo alto, el acumulado sube gradualmente hacia ese valor. Al ingresar a una zona más segura, baja de forma proporcional a la distancia recorrida en esa zona.

Los perfiles de riesgo por comuna usan cinco variables (todas en escala 0–100):

| Variable | Símbolo | Efecto |
|----------|---------|--------|
| Criminalidad | C | Aumenta riesgo |
| Seguridad | S | Reduce riesgo |
| Vigilancia | V | Reduce riesgo |
| Iluminación | I | Reduce riesgo |
| Flujo de personas | F | Aumenta riesgo |

Ver modelo completo en [docs/math-model.md](docs/math-model.md).

---

## Base de datos (Supabase)

### Tablas principales

| Tabla | Propósito |
|-------|-----------|
| `communes` | Geometría PostGIS de las 22 comunas (MultiPolygon, EPSG:4326) |
| `commune_risk_profiles` | Perfiles de riesgo (C, S, V, I, F, riskScore, riskLevel) por comuna |
| `risk_model_versions` | Registro del modelo activo (euler-v1) y su fórmula |
| `risk_model_coefficients` | Coeficientes a, b, d, e, h del modelo activo |
| `data_sources` | Trazabilidad del origen y calidad de cada dataset |
| `annual_crime_indicators` | Indicadores anuales por commune (solo server-side) |
| `risk_time_windows` | Ventanas temporales de riesgo por horario |

### Vistas

| Vista | Propósito |
|-------|-----------|
| `communes_geojson` | Expone geometría como GeoJSON (`ST_AsGeoJSON`) para el repository |

RLS activo en todas las tablas. El acceso de lectura pública usa la clave publicable (anon); la clave secreta solo se usa en operaciones administrativas server-side.

---

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENROUTE_API_KEY` | Clave de API de OpenRouteService | Sí (siempre) |
| `SAFE_MAPS_DATA_SOURCE` | `local` o `supabase` (default: `local`) | No |
| `SAFE_MAPS_SUPABASE_URL` | URL del proyecto Supabase | Solo si `=supabase` |
| `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` | Clave anon/pública (RLS activo) | Solo si `=supabase` |
| `SAFE_MAPS_SUPABASE_SECRET_KEY` | Clave service_role (solo operaciones admin) | Opcional |

> **Importante:** ninguna clave lleva prefijo `NEXT_PUBLIC_`. Todas son server-side únicamente.

---

## Instalación y desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/Diego-8520/safe-maps.git
cd safe-maps

# Instalar dependencias
npm install

# Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local
# Editar apps/web/.env.local:
#   OPENROUTE_API_KEY=tu_clave_aqui
#   SAFE_MAPS_DATA_SOURCE=local          # o "supabase" si tienes las credenciales

# Ejecutar en desarrollo
npm run dev --workspace=apps/web
```

Abrir `http://localhost:3000/map`

Para verificar la fuente de datos activa: `http://localhost:3000/api/health/data-source`

---

## Scripts raíz

| Script | Propósito |
|--------|-----------|
| `npm run prepare-seeds` | Genera SQL de seed desde archivos Excel |
| `npm run prepare-geometry-seed` | Genera SQL de seed de geometría de comunas |
| `npm run prepare-all-seeds` | Genera y valida todos los seeds |
| `npm run validate-seeds` | Valida integridad de los seeds generados |

---

## Endpoints de API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/routes/analyze` | Analiza una ruta: geocodifica, enruta, segmenta, aplica Euler |
| `GET` | `/api/communes/risk` | Devuelve perfiles de riesgo de las 22 comunas (desde repository) |
| `GET` | `/api/health/data-source` | Estado de la fuente de datos activa y conteo de registros |

---

## Estructura de carpetas

```
safe-maps/
├── apps/web/
│   ├── app/
│   │   ├── api/
│   │   │   ├── communes/risk/route.ts       ← GET /api/communes/risk
│   │   │   ├── health/data-source/route.ts  ← GET /api/health/data-source
│   │   │   └── routes/analyze/route.ts      ← POST /api/routes/analyze
│   │   └── map/page.tsx                     ← Página principal del mapa
│   ├── components/map/
│   │   ├── map-layout.tsx                   ← Estado global, carga de GeoJSON
│   │   ├── map-libre-view.tsx               ← Renderizado MapLibre
│   │   ├── analysis/                        ← Paneles de análisis
│   │   ├── routes/                          ← Tipos, proveedor, utilidades
│   │   ├── sidebar/                         ← Componentes del panel lateral
│   │   └── popups/                          ← Popups de comuna y segmento
│   ├── lib/
│   │   ├── repositories/                    ← Interfaces + implementaciones local/supabase
│   │   ├── risk/                            ← Modelo Euler, derivada, umbrales
│   │   ├── routes/                          ← Normalización ORS, segmentación Haversine
│   │   ├── geo/                             ← Ray-casting, tipos GeoJSON
│   │   ├── openroute/                       ← Cliente ORS, errores, tipos
│   │   ├── supabase/                        ← Cliente PostgREST, config, tipos generados
│   │   └── types/                           ← Tipos compartidos (riesgo, modelo, tiempo)
│   └── public/data/
│       ├── comunas-cali.geojson             ← Geometría oficial de comunas (IDESC)
│       └── comunas-risk.json                ← Perfiles de riesgo locales (simulados)
├── supabase/
│   └── migrations/                          ← Migraciones SQL de Supabase
├── scripts/                                 ← Scripts de preparación de seeds
└── docs/                                    ← Documentación técnica
```

---

## Documentación técnica

| Documento | Contenido |
|-----------|-----------|
| [docs/architecture.md](docs/architecture.md) | Arquitectura general del sistema |
| [docs/data-architecture.md](docs/data-architecture.md) | Capa de datos: repositories, feature flag, flujo |
| [docs/repositories.md](docs/repositories.md) | Repository Pattern: interfaces e implementaciones |
| [docs/supabase-repositories.md](docs/supabase-repositories.md) | Repositorios Supabase, RLS, despliegue |
| [docs/database-schema.md](docs/database-schema.md) | Esquema completo de la base de datos |
| [docs/math-model.md](docs/math-model.md) | Modelo matemático Euler v1 |
| [docs/route-risk-pipeline.md](docs/route-risk-pipeline.md) | Pipeline técnico completo |
| [docs/spatial-lookup-architecture.md](docs/spatial-lookup-architecture.md) | Búsqueda espacial: ray-casting y estrategia PostGIS |
| [docs/data-sources.md](docs/data-sources.md) | Fuentes de datos, calidad y ética |
| [docs/roadmap.md](docs/roadmap.md) | Fases del proyecto |

---

## Nota académica

Safe Maps es un proyecto académico y de portafolio técnico desarrollado como ejercicio de integración de análisis geoespacial, modelos matemáticos diferenciales y desarrollo web moderno.

El modelo matemático es experimental. Los datos de riesgo actuales son simulados. Las geometrías de comunas provienen de la fuente oficial IDESC del municipio de Cali. Ningún resultado debe interpretarse como predicción real de seguridad, inteligencia criminal ni recomendación oficial de movilidad.
