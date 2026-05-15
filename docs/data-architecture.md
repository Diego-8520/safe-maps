# Safe Maps — Arquitectura de datos

Describe la capa de acceso a datos: feature flag, repositories, flujo desde la base de datos hasta la UI, y fuente única de verdad del riesgo por comuna.

---

## Estado actual

Safe Maps puede operar en dos modos, controlados por la variable de entorno `SAFE_MAPS_DATA_SOURCE`:

| Modo | Fuente de riesgo | Fuente de geometría |
|------|-----------------|---------------------|
| `local` (default) | `public/data/comunas-risk.json` | `public/data/comunas-cali.geojson` |
| `supabase` | Supabase: tabla `commune_risk_profiles` | Supabase: vista `communes_geojson` (PostGIS) |

El modo activo en producción y desarrollo es `supabase` (configurado en `apps/web/.env.local`). Los archivos locales permanecen como fallback.

---

## Flujo completo de riesgo: DB → UI

```
Supabase: commune_risk_profiles + communes
         │
         ▼
SupabaseCommuneRiskRepository.getAll()
         │
         ▼
GET /api/communes/risk               (force-dynamic; server-side)
         │
         ▼
loadEnrichedGeojson()                (components/map/data/load-communes.ts)
  ├── fetch("/data/comunas-cali.geojson")   → geometría offline
  └── fetch("/api/communes/risk")           → perfiles de riesgo
         │
         ▼
communesGeojson: GeoJSON.FeatureCollection  (estado React en MapLayout)
  ├── MapLibreView    → capa "comunas-fill" coloreada por riskLevel
  ├── selectedCommune → useMemo(communesGeojson, selectedCommuneId) → panel lateral
  └── popups          → normalizeCommuneProperties(feature.properties) al hacer hover
```

**Regla:** la UI nunca lee riesgo directamente de archivos locales ni de MapLibre feature properties para estado persistente. Todo deriva de `communesGeojson`, que proviene de `GET /api/communes/risk`.

---

## Fuente única de verdad

`GET /api/communes/risk` es la única fuente de riesgo por comuna para la UI. Todos los valores que se muestran deben coincidir:

| Punto de visualización | Fuente del valor |
|-----------------------|-----------------|
| Color de relleno de la capa del mapa | `communesGeojson.features[i].properties.riskLevel` |
| Popup al pasar el cursor sobre comuna | `communesGeojson.features[i].properties` (via `normalizeCommuneProperties`) |
| Panel lateral al seleccionar comuna | `selectedCommune = useMemo(communesGeojson, selectedCommuneId)` |
| `localRiskScore` en segmentos de ruta | `getCommuneRiskRepository().getAll()` (server-side, misma fuente) |

---

## Feature Flag

```typescript
// lib/supabase/config.ts
function getSafeMapsDataSource(): "local" | "supabase" {
  return process.env.SAFE_MAPS_DATA_SOURCE === "supabase" ? "supabase" : "local";
}
```

```typescript
// lib/repositories/repository-factory.ts
export function getCommuneRiskRepository(): CommuneRiskRepository {
  if (getSafeMapsDataSource() === "supabase") {
    return new SupabaseCommuneRiskRepository();
  }
  return localCommuneRiskRepository;
}
```

El flag se evalúa en tiempo de ejecución server-side; no hay recompilación necesaria para cambiar de fuente.

---

## Repository Pattern

### Interfaces

```typescript
// lib/repositories/commune-repository.ts
interface CommuneRepository {
  getFeatures(): Promise<CommuneFeature[]>;
}

// lib/repositories/commune-risk-repository.ts
interface CommuneRiskRepository {
  getAll(): Promise<CommuneRisk[]>;
}
```

### Implementaciones locales

| Clase | Fuente | Propósito |
|-------|--------|-----------|
| `LocalCommuneRepository` | `comunas-cali.geojson` | Geometría para ray-casting (fallback) |
| `LocalCommuneRiskRepository` | `comunas-risk.json` | Perfiles de riesgo simulados (fallback) |

### Implementaciones Supabase

| Clase | Consulta | Propósito |
|-------|---------|-----------|
| `SupabaseCommuneRepository` | Vista `communes_geojson` | Geometría PostGIS como GeoJSON Feature[] |
| `SupabaseCommuneRiskRepository` | `commune_risk_profiles` JOIN `communes` | Perfiles de riesgo desde PostgreSQL |

`SupabaseCommuneRepository` lee desde `communes_geojson` (que expone `st_asgeojson(geometry)::jsonb`) en lugar de leer `communes.geometry` directamente, porque la serialización PostGIS no es estable a través de PostgREST.

---

## Capas y límites de importación

```
app/api/ y lib/routes/              ← pipeline de análisis
    │  importa singletons de
    ▼
lib/repositories/                   ← interfaces + implementaciones
    │  puede importar
    ▼
lib/geo/load-communes-geojson.ts    ← loader con caché para GeoJSON local
lib/risk/load-communes-risk.ts      ← loader con caché para JSON local
lib/supabase/server.ts              ← cliente PostgREST (server-side)
    │  lee
    ▼
public/data/ o Supabase            ← fuentes de datos

components/                         ← UI React
    │  NO importa repositories ni loaders
    ▼
fetch("/api/communes/risk")         ← única ruta de datos para la UI
```

**Restricciones:**
- El pipeline no importa loaders directamente.
- Los componentes de UI no importan repositories, loaders ni el cliente de Supabase.
- Supabase client (`lib/supabase/server.ts`) solo se instancia en contextos server-side.

---

## Endpoint `GET /api/communes/risk`

```typescript
// app/api/communes/risk/route.ts
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getCommuneRiskRepository().getAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load commune risk data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

Devuelve `CommuneRisk[]`:

```typescript
interface CommuneRisk {
  comuna: number;        // 1–22
  riskScore: number;     // 0–100
  riskLevel: RouteRiskLevel;
  criminalidad: number;
  seguridad: number;
  vigilancia: number;
  iluminacion: number;
  flujoPersonas: number;
}
```

---

## Tipo canónico `CommuneRisk`

`CommuneRisk` (en `lib/types/commune-risk.ts`) es el mismo tipo que `CommuneRiskData` (alias en `components/map/types.ts`). Ambos son idénticos; `CommuneRiskData` existe para contexto de frontend. El pipeline del servidor usa `CommuneRisk`.

---

## Archivos de datos locales

Los archivos locales permanecen en `public/data/` como fallback y para desarrollo sin Supabase:

| Archivo | Propósito |
|---------|-----------|
| `comunas-cali.geojson` | Geometría oficial de las 22 comunas (IDESC/QGIS, EPSG:4326) |
| `comunas-risk.json` | Perfiles de riesgo simulados (C, S, V, I, F, riskScore, riskLevel) |

Cuando `SAFE_MAPS_DATA_SOURCE=supabase`, `comunas-risk.json` no se lee para la UI. Sí se usa para comparación y como fuente de referencia del modo local.

---

## Limitaciones actuales

| Limitación | Impacto |
|-----------|---------|
| Sin persistencia de análisis | Los análisis de rutas son efímeros |
| Datos de riesgo simulados | `riskScore` no proviene de fuentes criminales reales |
| Sin caché server-side de ORS | Llamadas duplicadas a OpenRouteService |
| Ray-casting en JS | Correcto pero no escalable a datasets grandes |
