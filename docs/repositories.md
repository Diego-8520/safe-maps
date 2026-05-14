# Safe Maps — Repository Pattern

Describe las interfaces de repositorio, sus implementaciones locales actuales y las reglas de uso en el pipeline.

---

## Propósito

Los repositories abstraen el acceso a datos del pipeline de análisis de rutas. El pipeline declara qué necesita mediante una interfaz; la implementación concreta decide de dónde obtenerlo.

Esto permite reemplazar los archivos locales por Supabase sin modificar el pipeline.

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

**Contrato:** devuelve todos los features GeoJSON de comunas disponibles. No impone ninguna fuente (archivo, DB, API).

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

## Implementaciones locales

### `localCommuneRepository`

```typescript
// lib/repositories/local-commune-repository.ts
```

- Implementa `CommuneRepository`
- Delega a `loadCommunesGeoJSON()` (loader con caché de módulo)
- Lee `public/data/comunas-cali.geojson`
- Exporta un singleton tipado como `CommuneRepository`

### `localCommuneRiskRepository`

```typescript
// lib/repositories/local-commune-risk-repository.ts
```

- Implementa `CommuneRiskRepository`
- Delega a `loadCommunesRisk()` (loader con caché de módulo)
- Lee `public/data/comunas-risk.json`
- Exporta un singleton tipado como `CommuneRiskRepository`

Los singletons se tipan con la interfaz (no con la clase concreta) para que la sustitución futura no requiera cambiar el código de consumo.

---

## Responsabilidades

| Repository | Responsabilidad |
|-----------|----------------|
| `CommuneRepository` | Proveer geometría de comunas como `CommuneFeature[]` |
| `CommuneRiskRepository` | Proveer perfiles de riesgo como `CommuneRisk[]` |

---

## Qué NO deben hacer los repositories

- No ejecutan lógica de negocio (sin Euler, sin cálculos de riesgo).
- No transforman datos más allá del parseo del formato de origen.
- No llaman a otros repositories entre sí.
- No dependen de React, Next.js, MapLibre ni ningún framework de UI.
- No exponen tipos internos del loader o de la fuente de datos.
- No tienen estado de sesión de usuario.

---

## Migración a Supabase

Para reemplazar la implementación local por Supabase:

1. Crear `SupabaseCommuneRepository implements CommuneRepository`:
   ```typescript
   // lib/repositories/supabase-commune-repository.ts
   class SupabaseCommuneRepository implements CommuneRepository {
     async getFeatures(): Promise<CommuneFeature[]> {
       // SELECT id, ST_AsGeoJSON(geometry) FROM communes
       // Construir CommuneFeature[] desde filas de DB
     }
   }
   ```

2. Crear `SupabaseCommuneRiskRepository implements CommuneRiskRepository`:
   ```typescript
   // lib/repositories/supabase-commune-risk-repository.ts
   class SupabaseCommuneRiskRepository implements CommuneRiskRepository {
     async getAll(): Promise<CommuneRisk[]> {
       // SELECT * FROM commune_risk_profiles
     }
   }
   ```

3. En `local-commune-repository.ts` y `local-commune-risk-repository.ts`, sustituir el singleton exportado:
   ```typescript
   // Antes:
   export const localCommuneRepository: CommuneRepository = new LocalCommuneRepository();
   // Después:
   export const localCommuneRepository: CommuneRepository = new SupabaseCommuneRepository();
   ```

El pipeline (`normalize-openroute-route.ts`) no cambia.

---

## Reglas de importación

```
pipeline (lib/routes/, app/api/)
    │  puede importar
    ▼
lib/repositories/  (interfaces y singletons)
    │  puede importar
    ▼
lib/geo/load-communes-geojson.ts
lib/risk/load-communes-risk.ts
    │  puede importar
    ▼
node:fs, node:path  (solo server-side)
```

**Restricciones explícitas:**

| Capa | Prohibición |
|------|------------|
| `pipeline` | No importa loaders directamente |
| `components/` | No importa loaders ni repositories |
| `repositories/` | No importa desde `components/` |
| `loaders` | No importan desde `repositories/` (dependencia circular) |

---

## Archivos relevantes

| Archivo | Rol |
|--------|-----|
| `lib/repositories/commune-repository.ts` | Interfaz `CommuneRepository` |
| `lib/repositories/commune-risk-repository.ts` | Interfaz `CommuneRiskRepository` |
| `lib/repositories/local-commune-repository.ts` | Implementación local + singleton |
| `lib/repositories/local-commune-risk-repository.ts` | Implementación local + singleton |
| `lib/geo/load-communes-geojson.ts` | Loader con caché para GeoJSON |
| `lib/risk/load-communes-risk.ts` | Loader con caché para perfiles de riesgo |
| `lib/types/commune-risk.ts` | Tipo canónico `CommuneRisk` |
| `lib/geo/geojson-types.ts` | Tipos canónicos GeoJSON (`CommuneFeature`, etc.) |

Ver contexto de migración en [docs/data-architecture.md](data-architecture.md).
