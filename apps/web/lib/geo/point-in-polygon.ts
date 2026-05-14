import type { GeoJsonPosition, GeoJsonRing } from "./geojson-types";

function rayIntersectsSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): boolean {
  if (ay === by) return false; // horizontal edge — collinear, skip
  if (py < Math.min(ay, by) || py >= Math.max(ay, by)) return false;
  const t = (py - ay) / (by - ay);
  return ax + t * (bx - ax) > px;
}

function pointInRing(point: GeoJsonPosition, ring: GeoJsonRing): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[j];
    if (rayIntersectsSegment(px, py, ax, ay, bx, by)) inside = !inside;
  }
  return inside;
}

/**
 * Ray-casting PIP with hole support.
 * rings[0] = exterior ring; rings[1..] = holes.
 * Point must be inside the exterior and outside every hole.
 */
export function pointInPolygon(
  point: GeoJsonPosition,
  rings: GeoJsonRing[],
): boolean {
  if (rings.length === 0) return false;
  const [exterior, ...holes] = rings;
  if (!pointInRing(point, exterior)) return false;
  for (const hole of holes) {
    if (pointInRing(point, hole)) return false;
  }
  return true;
}
