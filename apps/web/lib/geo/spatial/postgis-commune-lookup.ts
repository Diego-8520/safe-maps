/**
 * TODO: PostGIS-backed spatial commune lookup — NOT ACTIVE.
 *
 * This file is a placeholder describing the future implementation.
 * No queries are executed. No DB connection exists.
 *
 * === What this will do ===
 *
 * Replace the in-memory ray-casting scan with a PostGIS spatial query:
 *
 *   SELECT id
 *   FROM communes
 *   WHERE ST_Within(ST_SetSRID(ST_MakePoint($lng, $lat), 4326), geometry)
 *   LIMIT 1;
 *
 * This query uses the GIST spatial index on the `geometry` column,
 * reducing commune lookup from O(features × vertices) to O(log n).
 *
 * === Interface change required ===
 *
 * The current SpatialCommuneLookupStrategy.findCommuneId() is synchronous.
 * PostGIS requires a DB round-trip — it must become async:
 *
 *   Before (current):
 *     findCommuneId(point: GeoJsonPosition, features: CommuneFeature[]): number | null
 *
 *   After (PostGIS):
 *     findCommuneId(point: GeoJsonPosition): Promise<number | null>
 *
 * When this change lands, normalize-openroute-route.ts must update the segment
 * map from sync .map() to async Promise.all(chunks.map(async (chunk) => ...)).
 *
 * The `features: CommuneFeature[]` parameter will be removed from the interface
 * since PostGIS owns the data — the pipeline no longer fetches GeoJSON.
 *
 * === Dependencies ===
 *
 * - @supabase/ssr installed and configured
 * - Supabase project connected (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY)
 * - Migration: `CREATE TABLE communes (id INTEGER, geometry GEOMETRY(MULTIPOLYGON, 4326))`
 * - Migration: `CREATE INDEX communes_geometry_gist ON communes USING GIST (geometry)`
 * - Migration: `ALTER TABLE communes ENABLE ROW LEVEL SECURITY`
 * - GeoJSON data seeded into the communes table from data/processed/
 *
 * === Migration steps when ready ===
 *
 * 1. Implement PostGISCommuneLookupStrategy below using createSupabaseServerClient()
 * 2. Update SpatialCommuneLookupStrategy interface to async
 * 3. Update find-commune-for-point.ts façade to await the strategy
 * 4. Update normalize-openroute-route.ts segment map to use Promise.all()
 * 5. Remove CommuneRepository.getFeatures() from the route pipeline
 *    (PostGIS owns the lookup; the GeoJSON features array is no longer needed)
 * 6. Keep CommuneRepository.getFeatures() for map rendering (client-side GeoJSON layer)
 *
 * === Stub (not functional) ===
 */

import type { GeoJsonPosition, CommuneFeature } from "../geojson-types";
import type { SpatialCommuneLookupStrategy } from "./spatial-commune-lookup-strategy";

/**
 * NOT FUNCTIONAL — stub only.
 *
 * The `features` parameter is accepted to satisfy the current sync interface
 * but will be removed when the interface becomes async.
 */
class PostGISCommuneLookupStrategy implements SpatialCommuneLookupStrategy {
  findCommuneId(_point: GeoJsonPosition, _features: CommuneFeature[]): number | null {
    throw new Error(
      "PostGISCommuneLookupStrategy is not yet implemented. " +
        "Configure Supabase and write the ST_Within migration before activating this strategy.",
    );
  }
}

/** Exported for reference only — do NOT use in the pipeline until implemented. */
export const postgisCommuneLookup: SpatialCommuneLookupStrategy =
  new PostGISCommuneLookupStrategy();
