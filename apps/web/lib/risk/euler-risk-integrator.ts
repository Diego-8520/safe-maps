/**
 * Euler risk integrator — second layer of the differential risk pipeline.
 *
 * Evolves accumulated risk R across a sequence of segments using the forward
 * Euler method:
 *
 *   R(x + Δx) = clamp(R(x) + dR/dx · Δx_km, 0, 100)
 *
 * where dR/dx comes from calculateRiskDerivative in risk-derivative.ts.
 *
 * NOT integrated into the production pipeline yet.
 * Next step: replace calculatePreliminaryAccumulatedRisk in accumulated-risk.ts
 * with a call to calculateEulerRiskEvolution, mapping RouteSegment → EulerRiskSegmentInput.
 */

import {
  calculateRiskDerivative,
  type RiskDerivativeInput,
} from "@/lib/risk/risk-derivative";
import { scoreToRiskLevel } from "@/lib/risk/risk-level";
import type { RouteRiskLevel } from "@/components/map/routes/route-types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface EulerRiskSegmentInput {
  id: string;
  distanceMeters: number;
  riskVariables: RiskDerivativeInput;
}

export interface EulerRiskSegmentResult {
  id: string;
  /** dR/dx in risk-points per km */
  derivative: number;
  /** Segment length in km */
  deltaKm: number;
  /** Accumulated risk score at the END of this segment [0, 100] */
  riskScore: number;
  riskLevel: RouteRiskLevel;
}

export interface EulerRiskEvolutionResult {
  segments: EulerRiskSegmentResult[];
  finalRiskScore: number;
  finalRiskLevel: RouteRiskLevel;
}

// ---------------------------------------------------------------------------
// Pure integrator
// ---------------------------------------------------------------------------

/**
 * Computes Euler-integrated risk evolution over a list of segments.
 *
 * Pure function: no I/O, no React, no MapLibre, no Next.js runtime deps.
 *
 * Example (commune 13 high-risk corridor, 0.5 km):
 *   input  = { criminalidad:85, seguridad:30, vigilancia:35, iluminacion:40, flujoPersonas:72 }
 *   dR/dx  ≈ 19.3  →  R(0.5) = clamp(50 + 19.3·0.5, 0, 100) ≈ 59.7
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
    const derivative = calculateRiskDerivative(seg.riskVariables);
    const next = clamp(current + derivative * deltaKm, 0, 100);
    const riskScore = Math.round(next * 10) / 10; // one decimal, avoids int drift

    results.push({
      id: seg.id,
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
