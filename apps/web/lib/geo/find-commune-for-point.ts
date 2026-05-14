import type { GeoJsonPosition, CommuneFeature } from "./geojson-types";
import { pointInPolygon } from "./point-in-polygon";

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

function isPointInFeature(
  point: GeoJsonPosition,
  feature: CommuneFeature,
): boolean {
  const { geometry } = feature;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((rings) => pointInPolygon(point, rings));
  }
  return false;
}

export function findCommuneForPoint(
  point: GeoJsonPosition,
  features: CommuneFeature[],
): number | null {
  for (const feature of features) {
    if (isPointInFeature(point, feature)) {
      return extractCommuneId(feature);
    }
  }
  return null;
}
