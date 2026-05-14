import type { RouteSegment } from "@/components/map/routes/route-types";
import { scoreToRiskLevel } from "./risk-level";

// Preliminary accumulated risk model — NOT the formal Euler/differential model.
//
// Formula per segment:
//   R_next = R_current + alpha * (localRiskScore - R_current)
//   alpha  = min(distanceMeters / 1000, 1) * K
//
// alpha scales with segment length so short segments produce smaller changes
// than long ones, avoiding abrupt jumps at commune boundaries.
// K controls overall convergence speed. Euler integration comes in a later phase.
const K = 0.35;

export function calculatePreliminaryAccumulatedRisk(
  segments: RouteSegment[],
  initialRisk = 50,
): RouteSegment[] {
  let current = initialRisk;

  return segments.map((seg) => {
    const alpha = Math.min(seg.distanceMeters / 1000, 1) * K;
    current = current + alpha * (seg.localRiskScore - current);
    current = Math.max(0, Math.min(100, current));
    const rounded = Math.round(current);

    return {
      ...seg,
      accumulatedRiskScore: rounded,
      accumulatedRiskLevel: scoreToRiskLevel(rounded),
    };
  });
}
