# Safe Maps — Arquitectura de búsqueda espacial de comunas

Describe el problema actual, las limitaciones del ray-casting, los beneficios de PostGIS, y la estrategia de reemplazo sin romper el pipeline.

---

## Problema actual

El pipeline de análisis de rutas necesita asignar cada segmento a una comuna. Para hacerlo, determina qué polígono de las 22 comunas de Cali contiene el punto central del segmento.

La implementación actual hace esto con un algoritmo de ray-casting en memoria:

```
Para cada segmento:
  midpoint = punto central del segmento
  Para cada feature en CommuneFeature[]:
    ¿midpoint está dentro del polígono de este feature?
    Sí → retornar communeId
  Ninguno → retornar null
```

El resultado es correcto pero el acoplamiento era directo: `normalize-openroute-route.ts` llamaba a `findCommuneForPoint(midpoint, features)` como función pura sin abstracción de estrategia.

---

## Limitaciones del ray-casting

| Limitación | Detalle |
|-----------|---------|
| Complejidad lineal | O(features × vértices) por segmento. Con 22 comunas y polígonos simples: aceptable. Con 1000+ comunas: inaceptable. |
| Sin índice espacial | Escanea todos los features en orden. No hay estructura de búsqueda espacial. |
| Memoria de proceso | El GeoJSON completo vive en RAM. Escala mal si el dataset crece (ej. 5000 polígonos). |
| Lógica duplicada | `extractCommuneId` y `isPointInFeature` vivían en `find-commune-for-point.ts` sin encapsular. |
| Acoplamiento a archivos locales | El pipeline recibía un `CommuneFeature[]` cargado del GeoJSON. PostGIS no necesita ese array. |

---

## Abstracción introducida: SpatialCommuneLookupStrategy

```typescript
// lib/geo/spatial/spatial-commune-lookup-strategy.ts
interface SpatialCommuneLookupStrategy {
  findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null;
}
```

`find-commune-for-point.ts` es ahora una façade de una línea sobre `rayCastingCommuneLookup`. El pipeline no sabe qué estrategia está activa.

```
normalize-openroute-route.ts
  → findCommuneForPoint(midpoint, features)      ← misma firma, mismo comportamiento
      → rayCastingCommuneLookup.findCommuneId()  ← delega a la estrategia
          → RayCastingCommuneLookupStrategy       ← encapsula ray-casting + extractCommuneId
              → pointInPolygon()                  ← algoritmo puro, sin cambios
```

---

## Estrategias disponibles

| Estrategia | Archivo | Estado |
|-----------|---------|--------|
| `RayCastingCommuneLookupStrategy` | `spatial/ray-casting-commune-lookup.ts` | Activa |
| `PostGISCommuneLookupStrategy` | `spatial/postgis-commune-lookup.ts` | Placeholder (throws) |

---

## Beneficios de PostGIS (fase futura)

```sql
SELECT id
FROM communes
WHERE ST_Within(
  ST_SetSRID(ST_MakePoint($lng, $lat), 4326),
  geometry
)
LIMIT 1;
```

| Aspecto | Ray-casting JS | PostGIS ST_Within |
|---------|---------------|------------------|
| Complejidad | O(features × vértices) | O(log n) con GIST index |
| Índice espacial | No | Sí (GIST) |
| Soporte de geometría | Polygon, MultiPolygon | Todos los tipos OGC |
| Precisión | Buena (WGS84 planar) | Alta (geodésica) |
| Escalabilidad | Limitada por RAM | Escalable |
| Latencia | < 1ms (in-memory) | ~1–5ms (round-trip DB local) |
| Mantenimiento de datos | GeoJSON en `public/data/` | Tabla `communes` en Supabase |

---

## Estrategia de reemplazo sin romper el pipeline

### Paso 1 — Actualizar la interfaz a async

```typescript
// Antes (actual):
interface SpatialCommuneLookupStrategy {
  findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null;
}

// Después (PostGIS):
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
// Antes:
const rawSegments = chunks.map((chunk, index) => {
  const communeId = findCommuneForPoint(midpoint, features);
  ...
});

// Después:
const rawSegments = await Promise.all(
  chunks.map(async (chunk, index) => {
    const communeId = await findCommuneForPoint(midpoint);
    ...
  })
);
```

### Paso 4 — Eliminar features del pipeline

Cuando PostGIS gestiona el lookup, el pipeline ya no necesita cargar el GeoJSON de comunas. `localCommuneRepository.getFeatures()` solo será necesario para la capa de renderizado del mapa (client-side).

---

## Flujo futuro con PostGIS

```
normalize-openroute-route.ts
  │
  ├── localCommuneRiskRepository.getAll()     ← sigue siendo local hasta que se migre
  │
  └── findCommuneForPoint(midpoint)           ← async, sin features array
        │
        └── postgisCommuneLookup.findCommuneId(point)
              │
              └── SELECT id FROM communes WHERE ST_Within(...)  ← Supabase / PostGIS
```

---

## Estado actual de preparación para ST_Within

| Requisito | Estado |
|-----------|--------|
| Interface abstracta `SpatialCommuneLookupStrategy` | Creada |
| Ray-casting encapsulado en estrategia | Completo |
| Façade `findCommuneForPoint` desacoplada | Completo |
| Placeholder PostGIS con TODOs | Creado (throws en runtime) |
| Migración de interfaz a async | Pendiente (documentada en placeholder) |
| Supabase configurado | Pendiente |
| Tabla `communes` con geometría PostGIS | Pendiente |
| Índice GIST en geometry | Pendiente |
| Seed GeoJSON → tabla communes | Pendiente |
