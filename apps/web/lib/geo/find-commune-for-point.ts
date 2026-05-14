import type { GeoJsonPosition, CommuneFeature } from "./geojson-types";
import { rayCastingCommuneLookup } from "./spatial/ray-casting-commune-lookup";

/**
 * Resolves a commune ID for a geographic point using the active lookup strategy.
 *
 * Current strategy: RayCastingCommuneLookupStrategy (in-memory, sync).
 * Future strategy: PostGISCommuneLookupStrategy — swap rayCastingCommuneLookup
 * for postgisCommuneLookup in the import above and update the interface to async.
 *
 * See lib/geo/spatial/ for available strategies and migration notes.
 */
export function findCommuneForPoint(
  point: GeoJsonPosition,
  features: CommuneFeature[],
): number | null {
  return rayCastingCommuneLookup.findCommuneId(point, features);
}
