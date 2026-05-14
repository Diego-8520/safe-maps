import type { GeoJsonPosition, CommuneFeature } from "../geojson-types";

/**
 * Strategy interface for resolving a commune ID from a geographic point.
 *
 * Current contract is synchronous to match the in-memory ray-casting pipeline.
 * When PostGIS is integrated, this interface will change to async:
 *
 *   findCommuneId(point: GeoJsonPosition): Promise<number | null>
 *
 * That change will require updating normalize-openroute-route.ts to use
 * Promise.all() over the segment map instead of a sync .map() call.
 *
 * Implementations:
 *   RayCastingCommuneLookupStrategy — current, in-memory, O(features)
 *   PostGISCommuneLookupStrategy    — future, DB query, O(log n) via GIST index
 */
export interface SpatialCommuneLookupStrategy {
  /**
   * Returns the commune ID for a geographic point, or null if no commune contains it.
   *
   * @param point    [lng, lat] in WGS84
   * @param features Full set of commune GeoJSON features to search against.
   *                 PostGIS implementations will ignore this parameter and query the DB.
   */
  findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null;
}
