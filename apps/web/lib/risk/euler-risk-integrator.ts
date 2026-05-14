/**
 * Euler risk integrator - second layer of the accumulated-risk pipeline.
 *
 * Evolves accumulated risk R across route segments using a forward Euler step
 * that moves the current state toward the local risk of the current segment:
 *
 *   R(n+1) = clamp(R(n) + k * (localRiskScore - R(n)) * deltaKm, 0, 100)
 *
 * This keeps accumulated risk conceptually aligned with Safe Maps: a medium or
 * high local-risk commune pulls the accumulated score toward that local risk
 * instead of letting unrelated variable weights push it in the opposite direction.
 */

import { scoreToRiskLevel } from "@/lib/risk/risk-level";
import type { RouteRiskLevel } from "@/lib/types/risk";

const EULER_LOCAL_RISK_RESPONSE_K = 1;

export interface EulerRiskSegmentInput {
  id: string;
  distanceMeters: number;
  localRiskScore: number;
}

export interface EulerRiskSegmentResult {
  id: string;
  /** Segment local risk target [0, 100] */
  localRiskScore: number;
  /** Effective dR/dx in risk-points per km for this step */
  derivative: number;
  /** Segment length in km */
  deltaKm: number;
  /** Accumulated risk score at the end of this segment [0, 100] */
  riskScore: number;
  riskLevel: RouteRiskLevel;
}

export interface EulerRiskEvolutionResult {
  segments: EulerRiskSegmentResult[];
  finalRiskScore: number;
  finalRiskLevel: RouteRiskLevel;
}

/**
 * Computes Euler-integrated risk evolution over a list of route segments.
 *
 * Pure function: no I/O, no React, no MapLibre, no Next.js runtime deps.
 */
export function calculateEulerRiskEvolution(
  initialRiskScore: number,
  segments: EulerRiskSegmentInput[],
): EulerRiskEvolutionResult {
  if (segments.length === 0) {
    const finalRiskScore = Math.round(clamp(initialRiskScore, 0, 100));
    return {
      segments: [],
      finalRiskScore,
      finalRiskLevel: scoreToRiskLevel(finalRiskScore),
    };
  }

  let current = clamp(initialRiskScore, 0, 100);
  const results: EulerRiskSegmentResult[] = [];

  for (const seg of segments) {
    const deltaKm = seg.distanceMeters / 1000;
    const localRiskScore = clamp(seg.localRiskScore, 0, 100);
    const derivative = EULER_LOCAL_RISK_RESPONSE_K * (localRiskScore - current);
    const next = clamp(current + derivative * deltaKm, 0, 100);
    const riskScore = Math.round(next * 10) / 10;

    results.push({
      id: seg.id,
      localRiskScore,
      derivative: Math.round(derivative * 100) / 100,
      deltaKm: Math.round(deltaKm * 1000) / 1000,
      riskScore,
      riskLevel: scoreToRiskLevel(riskScore),
    });

    current = next;
  }

  const finalRiskScore = Math.round(current * 10) / 10;
  return {
    segments: results,
    finalRiskScore,
    finalRiskLevel: scoreToRiskLevel(finalRiskScore),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
