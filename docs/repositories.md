# Safe Maps — Repository Pattern

Describe las interfaces de repositorio, sus implementaciones (local y Supabase), el factory, y las reglas de importación.

---

## Propósito

Los repositories abstraen el acceso a datos del pipeline de análisis de rutas. El pipeline declara qué necesita mediante una interfaz; la implementación concreta decide de dónde obtenerlo (archivo local o Supabase). Esto permite cambiar la fuente de datos sin modificar el pipeline.

---

## Interfaces

### `CommuneRepository`

```typescript
// lib/repositories/commune-repository.ts
import type { CommuneFeature } from "@/lib/geo/geojson-types";

export interface CommuneRepository {
  getFeatures(): Promise<CommuneFeature[]>;
}
```

**Contrato:** devuelve todos los features GeoJSON de las 22 comunas de Cali. No impone ninguna fuente.

---

### `CommuneRiskRepository`

```typescript
// lib/repositories/commune-risk-repository.ts
import type { CommuneRisk } from "@/lib/types/commune-risk";

export interface CommuneRiskRepository {
  getAll(): Promise<CommuneRisk[]>;
}
```

**Contrato:** devuelve todos los perfiles de riesgo por comuna. `CommuneRisk` es el tipo canónico en `lib/types/commune-risk.ts`.

---

## Factory

```typescript
// lib/repositories/repository-factory.ts
export function getCommuneRepository(): CommuneRepository
export function getCommuneRiskRepository(): CommuneRiskRepository
```

**Lógica de selección:** basada en `SAFE_MAPS_DATA_SOURCE` (variable de entorno server-side):

| Valor | Repository devuelto |
|-------|-------------------|
| `"supabase"` | `SupabaseCommuneRepository` / `SupabaseCommuneRiskRepository` |
| cualquier otro (incluyendo ausente) | `localCommuneRepository` / `localCommuneRiskRepository` |

El factory se evalúa en runtime, no en compilación.

---

## Implementaciones locales

### `LocalCommuneRepository`

```typescript
// lib/repositories/local-commune-repository.ts
```

- Implementa `CommuneRepository`
- Delega a `loadCommunesGeoJSON()` (loader con caché de módulo)
- Lee `public/data/comunas-cali.geojson`
- Exporta un singleton tipado como `CommuneRepository`

### `LocalCommuneRiskRepository`

```typescript
// lib/repositories/local-commune-risk-repository.ts
```

- Implementa `CommuneRiskRepository`
- Delega a `loadCommunesRisk()` (loader con caché de módulo)
- Lee `public/data/comunas-risk.json`
- Exporta un singleton tipado como `CommuneRiskRepository`

---

## Implementaciones Supabase

### `SupabaseCommuneRepository`

```typescript
// lib/repositories/supabase-commune-repository.ts
```

- Implementa `CommuneRepository`
- Consulta la vista `communes_geojson` vía PostgREST
- Selecciona: `zona_id`, `comuna_numero`, `name`, `geometry_geojson`
- Parsea `geometry_geojson` (JSON string) y construye `CommuneFeature[]`
- Usa `geometry_geojson` (producida por `ST_AsGeoJSON`) en lugar de `communes.geometry` directamente, para evitar dependencia de la serialización PostGIS
- Ordena por `comuna_numero.asc`

### `SupabaseCommuneRiskRepository`

```typescript
// lib/repositories/supabase-commune-risk-repository.ts
```

- Implementa `CommuneRiskRepository`
- Consulta `commune_risk_profiles` con JOIN a `communes` por FK
- Selecciona: `criminalidad`, `seguridad`, `vigilancia`, `iluminacion`, `flujo_personas`, `risk_score`, `risk_level`
- Mapea columnas snake_case de Postgres a camelCase del tipo `CommuneRisk`
- Ordena por `communes.comuna_numero.asc`

---

## Responsabilidades de los repositories

| Repository | Responsabilidad |
|-----------|----------------|
| `CommuneRepository` | Proveer geometría de comunas como `CommuneFeature[]` |
| `CommuneRiskRepository` | Proveer perfiles de riesgo como `CommuneRisk[]` |

**Qué NO deben hacer los repositories:**
- No ejecutan lógica de negocio (sin Euler, sin cálculos de riesgo)
- No transforman datos más allá del parseo del formato de origen
- No llaman a otros repositories entre sí
- No dependen de React, Next.js, MapLibre ni ningún framework de UI
- No exponen tipos internos del loader o de la fuente de datos
- No tienen estado de sesión de usuario

---

## Reglas de importación

```
app/api/ y lib/routes/              ← pipeline de análisis (puede importar)
         │
         ▼
lib/repositories/                   ← interfaces y factory (puede importar)
         │
         ├── local-commune-repository.ts
         │         │  puede importar
         │         ▼
         │   lib/geo/load-communes-geojson.ts
         │   lib/risk/load-communes-risk.ts
         │
         └── supabase-commune-repository.ts
                   │  puede importar
                   ▼
             lib/supabase/server.ts  ← solo server-side
```

**Restricciones explícitas:**

| Capa | Prohibición |
|------|------------|
| `pipeline` | No importa loaders directamente |
| `components/` | No importa loaders ni repositories |
| `repositories/` | No importa desde `components/` |
| `loaders` | No importan desde `repositories/` (dependencia circular) |
| `supabase/server.ts` | No se instancia en componentes de cliente |

---

## Archivos relevantes

| Archivo | Rol |
|--------|-----|
| `lib/repositories/repository-factory.ts` | Factory; selecciona implementación según feature flag |
| `lib/repositories/commune-repository.ts` | Interfaz `CommuneRepository` |
| `lib/repositories/commune-risk-repository.ts` | Interfaz `CommuneRiskRepository` |
| `lib/repositories/local-commune-repository.ts` | Implementación local + singleton |
| `lib/repositories/local-commune-risk-repository.ts` | Implementación local + singleton |
| `lib/repositories/supabase-commune-repository.ts` | Implementación Supabase para geometría |
| `lib/repositories/supabase-commune-risk-repository.ts` | Implementación Supabase para riesgo |
| `lib/geo/load-communes-geojson.ts` | Loader con caché para GeoJSON local |
| `lib/risk/load-communes-risk.ts` | Loader con caché para JSON de riesgo local |
| `lib/types/commune-risk.ts` | Tipo canónico `CommuneRisk` |
| `lib/geo/geojson-types.ts` | Tipos canónicos GeoJSON (`CommuneFeature`, etc.) |

Ver flujo completo en [docs/data-architecture.md](data-architecture.md).
Ver configuración de Supabase en [docs/supabase-repositories.md](supabase-repositories.md).
