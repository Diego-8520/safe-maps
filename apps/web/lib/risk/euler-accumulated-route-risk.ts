/**
 * Euler-based route risk accumulator — orchestration layer (riskModelVersion: euler-v1).
 *
 * Primary accumulated-risk model for real routes via OpenRouteService.
 * Applies the Euler ODE integrator to a full RouteAnalysis, replacing
 * accumulatedRiskScore/accumulatedRiskLevel per segment and the final risk
 * totals, while preserving every other field immutably.
 *
 * calculatePreliminaryAccumulatedRisk (accumulated-risk.ts) is retained for
 * rollback or comparison purposes but is no longer called in the main pipeline.
 */

import type { RouteAnalysis } from "@/components/map/routes/route-types";
import type { CommuneRisk } from "@/lib/types/commune-risk";
import { buildEulerRiskSegmentsFromRouteSegments } from "@/lib/risk/build-euler-risk-input";
import { calculateEulerRiskEvolution } from "@/lib/risk/euler-risk-integrator";
import { scoreToRiskLevel } from "@/lib/risk/risk-level";

/**
 * Computes Euler-integrated accumulated risk for every segment in a RouteAnalysis.
 *
 * Pure function: no I/O, no React, no MapLibre, no Next.js runtime deps.
 *
 * @param routeAnalysis   Route with segments and localRiskScore already assigned.
 * @param riskData        Full CommuneRisk dataset (e.g. from loadCommunesRisk()).
 * @param initialRiskScore Starting accumulated risk. Defaults to routeAnalysis.initialRiskScore
 *                         so the route starts at the real origin commune risk, not at the
 *                         first segment midpoint risk or an artificial mid-range value.
 * @returns               New RouteAnalysis with Euler-derived accumulated risk values.
 */
export function calculateEulerAccumulatedRouteRisk(
  routeAnalysis: RouteAnalysis,
  riskData: CommuneRisk[],
  initialRiskScore?: number,
): RouteAnalysis {
  const resolvedInitialRiskScore =
    initialRiskScore ?? routeAnalysis.initialRiskScore ?? routeAnalysis.segments[0]?.localRiskScore ?? 50;

  const eulerSegmentsInput = buildEulerRiskSegmentsFromRouteSegments(
    routeAnalysis.segments,
    riskData,
  );

  const evolution = calculateEulerRiskEvolution(resolvedInitialRiskScore, eulerSegmentsInput);

  const segments = routeAnalysis.segments.map((segment, index) => {
    const eulerSegment = evolution.segments[index];

    // Guard against index misalignment (should not occur, but safe is safe).
    if (!eulerSegment) return segment;

    return {
      ...segment,
      accumulatedRiskScore: eulerSegment.riskScore,
      accumulatedRiskLevel: scoreToRiskLevel(eulerSegment.riskScore),
    };
  });

  return {
    ...routeAnalysis,
    segments,
    finalRiskScore: evolution.finalRiskScore,
    finalRiskLevel: evolution.finalRiskLevel,
  };
}
