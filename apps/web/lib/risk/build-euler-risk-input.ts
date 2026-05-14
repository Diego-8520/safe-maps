/**
 * Bridge utility - converts RouteSegment[] into EulerRiskSegmentInput[].
 */

import type { RouteSegment } from "@/components/map/routes/route-types";
import type { EulerRiskSegmentInput } from "@/lib/risk/euler-risk-integrator";

/**
 * Converts RouteSegment[] into EulerRiskSegmentInput[] using the local risk
 * score already assigned during route normalization.
 *
 * Pure function: no I/O, no React, no MapLibre, no Next.js runtime deps.
 */
export function buildEulerRiskSegmentsFromRouteSegments(
  segments: RouteSegment[],
): EulerRiskSegmentInput[] {
  return segments.map((seg) => ({
    id: seg.id,
    distanceMeters: seg.distanceMeters,
    localRiskScore: seg.localRiskScore,
  }));
}
