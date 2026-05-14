import type { GeoJsonPosition, CommuneFeature } from "../geojson-types";
import { pointInPolygon } from "../point-in-polygon";
import type { SpatialCommuneLookupStrategy } from "./spatial-commune-lookup-strategy";

function extractCommuneId(feature: CommuneFeature): number | null {
  const p = feature.properties;
  const raw = p.comuna ?? p.COMUNA ?? p.id ?? p.ID ?? p.codigo ?? p.CODIGO ?? null;
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const m = raw.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }
  return null;
}

function isPointInFeature(point: GeoJsonPosition, feature: CommuneFeature): boolean {
  const { geometry } = feature;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((rings) => pointInPolygon(point, rings));
  }
  return false;
}

/**
 * In-memory spatial commune lookup using the ray-casting algorithm.
 *
 * Complexity: O(features × vertices) per call — acceptable for the current
 * dataset size (~22 communes, simple polygons). Loads all features into memory
 * on first call via the commune repository.
 *
 * Limitations:
 * - No spatial index: linear scan over all features per midpoint.
 * - Memory-bound: entire GeoJSON must fit in process memory.
 * - Not suitable for concurrent high-volume lookups.
 *
 * Migration path: replace with PostGISCommuneLookupStrategy when Supabase
 * is configured. See lib/geo/spatial/postgis-commune-lookup.ts.
 */
class RayCastingCommuneLookupStrategy implements SpatialCommuneLookupStrategy {
  findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null {
    for (const feature of features) {
      if (isPointInFeature(point, feature)) {
        return extractCommuneId(feature);
      }
    }
    return null;
  }
}

/** Singleton — stateless, safe to reuse across calls. */
export const rayCastingCommuneLookup: SpatialCommuneLookupStrategy =
  new RayCastingCommuneLookupStrategy();
