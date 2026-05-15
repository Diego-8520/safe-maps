# Safe Maps — Arquitectura de búsqueda espacial de comunas

Describe la estrategia actual de asignación de communes por punto, sus limitaciones y la estrategia futura con PostGIS ST_Within.

---

## Problema

El pipeline de análisis de rutas necesita asignar cada segmento a una comuna. Para hacerlo, determina qué polígono de las 22 comunas de Cali contiene el punto central del segmento.

---

## Estrategia activa: Ray-casting en memoria

**Implementación:** `lib/geo/spatial/ray-casting-commune-lookup.ts`

```
Para cada segmento:
  midpoint = punto central del segmento
  Para cada CommuneFeature:
    ¿midpoint está dentro del polígono de este feature?
    Sí → retornar communeId
  Ninguno → retornar null
```

El algoritmo de ray-casting está encapsulado en `RayCastingCommuneLookupStrategy`, que implementa la interfaz `SpatialCommuneLookupStrategy`. La función pública `findCommuneForPoint()` actúa como façade de una línea:

```typescript
// lib/geo/find-commune-for-point.ts
export function findCommuneForPoint(
  point: GeoJsonPosition,
  features: CommuneFeature[],
): number | null {
  return rayCastingCommuneLookup.findCommuneId(point, features);
}
```

El pipeline recibe `features` desde `getCommuneRepository().getFeatures()` y las pasa a `findCommuneForPoint()`.

---

## Estrategias disponibles

| Estrategia | Archivo | Estado |
|-----------|---------|--------|
| `RayCastingCommuneLookupStrategy` | `spatial/ray-casting-commune-lookup.ts` | **Activa** |
| `PostGISCommuneLookupStrategy` | `spatial/postgis-commune-lookup.ts` | Placeholder (throws en runtime) |

---

## Limitaciones del ray-casting

| Limitación | Detalle |
|-----------|---------|
| Complejidad lineal | O(features × vértices) por segmento. Con 22 comunas: aceptable. Con 1000+ comunas: inaceptable. |
| Sin índice espacial | Escanea todos los features en orden. |
| Memoria de proceso | El GeoJSON completo vive en RAM. |
| Solo sync | No puede hacer round-trips a DB de forma natural. |

Para el volumen actual (22 comunas, polígonos simples), el ray-casting es correcto y la latencia es <1 ms.

---

## Estrategia futura: PostGIS ST_Within

Cuando se active `PostGISCommuneLookupStrategy`, la query sería:

```sql
SELECT c.comuna_numero
FROM communes c
WHERE ST_Within(
  ST_SetSRID(ST_MakePoint($lng, $lat), 4326),
  c.geometry
)
LIMIT 1;
```

| Aspecto | Ray-casting JS | PostGIS ST_Within |
|---------|---------------|------------------|
| Complejidad | O(features × vértices) | O(log n) con GIST index |
| Índice espacial | No | Sí (GIST en `communes.geometry`) |
| Soporte de geometría | Polygon, MultiPolygon | Todos los tipos OGC |
| Latencia | <1 ms (in-memory) | ~1–5 ms (round-trip DB local) |
| Escalabilidad | Limitada por RAM | Escalable |
| Mantenimiento de datos | GeoJSON en `public/data/` | Tabla `communes` en Supabase |

---

## Estado de la tabla `communes` en Supabase

| Requisito | Estado |
|-----------|--------|
| Tabla `communes` creada | ✅ Completo |
| Índice GIST en `communes.geometry` | ✅ Completo |
| Geometría cargada (seed) | ✅ Completo |
| Vista `communes_geojson` para PostgREST | ✅ Completo |
| `SupabaseCommuneRepository` implementado | ✅ Completo |
| Interfaz `SpatialCommuneLookupStrategy` abstracta | ✅ Completo |
| `RayCastingCommuneLookupStrategy` encapsulado | ✅ Completo |
| `PostGISCommuneLookupStrategy` placeholder | ✅ Creado (throws en runtime) |
| Migración de interfaz a async | ⏳ Pendiente |
| `PostGISCommuneLookupStrategy` funcional | ⏳ Pendiente |

---

## Plan de migración a PostGIS

Para activar la estrategia PostGIS sin romper el pipeline:

### Paso 1 — Actualizar la interfaz a async

```typescript
// Antes (actual, sync):
interface SpatialCommuneLookupStrategy {
  findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null;
}

// Después (PostGIS, async):
interface SpatialCommuneLookupStrategy {
  findCommuneId(point: GeoJsonPosition): Promise<number | null>;
}
```

### Paso 2 — Actualizar la façade

```typescript
// find-commune-for-point.ts
export async function findCommuneForPoint(
  point: GeoJsonPosition,
): Promise<number | null> {
  return postgisCommuneLookup.findCommuneId(point);
}
```

### Paso 3 — Actualizar el pipeline

```typescript
// normalize-openroute-route.ts
const rawSegments = await Promise.all(
  chunks.map(async (chunk, index) => {
    const communeId = await findCommuneForPoint(midpoint);
    ...
  })
);
```

### Paso 4 — Eliminar features del pipeline

Cuando PostGIS gestione el lookup, el pipeline ya no necesita cargar el GeoJSON de comunas para ray-casting. `getCommuneRepository().getFeatures()` solo será necesario para la capa de renderizado del mapa (client-side vía `communesGeojson`).

---

## Flujo futuro con PostGIS

```
normalize-openroute-route.ts
  │
  ├── getCommuneRiskRepository().getAll()    ← sigue desde Supabase
  │
  └── findCommuneForPoint(midpoint)          ← async, sin features array
        │
        └── postgisCommuneLookup.findCommuneId(point)
              │
              └── SELECT FROM communes WHERE ST_Within(...)  ← Supabase / PostGIS
```
