/**
 * Bridge utility — converts RouteSegment[] into EulerRiskSegmentInput[].
 *
 * Resolves each segment's communeId against the CommuneRisk dataset to extract
 * the urban variables required by calculateRiskDerivative (risk-derivative.ts).
 *
 */

import type { RouteSegment } from "@/components/map/routes/route-types";
import type { CommuneRisk } from "@/lib/risk/risk-types";
import type { EulerRiskSegmentInput } from "@/lib/risk/euler-risk-integrator";
import type { RiskDerivativeInput } from "@/lib/risk/risk-derivative";

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

/**
 * Neutral mid-range variables used when communeId is null or has no match.
 * All set to 50 so dR/dx ≈ 0 — risk neither grows nor shrinks for unknown zones.
 *
 * Formula check: dR/dx = 30·0.5 − 15·0.5 − 10·0.5 − 10·0.5 + 8·0.5
 *                      = 15 − 7.5 − 5 − 5 + 4 = +1.5  (slight positive — conservative)
 */
const FALLBACK_RISK_VARIABLES: RiskDerivativeInput = {
  criminalidad: 50,
  seguridad: 50,
  vigilancia: 50,
  iluminacion: 50,
  flujoPersonas: 50,
};

// ---------------------------------------------------------------------------
// Public function
// ---------------------------------------------------------------------------

/**
 * Converts RouteSegment[] into EulerRiskSegmentInput[] by resolving commune
 * urban variables from riskData.
 *
 * Pure function: no I/O, no React, no MapLibre, no Next.js runtime deps.
 *
 * @param segments  Route segments, each optionally linked to a communeId.
 * @param riskData  Full CommuneRisk dataset (e.g. from loadCommunesRisk()).
 * @returns         One EulerRiskSegmentInput per input segment, in the same order.
 */
export function buildEulerRiskSegmentsFromRouteSegments(
  segments: RouteSegment[],
  riskData: CommuneRisk[],
): EulerRiskSegmentInput[] {
  // Index riskData once by commune number for O(1) lookups.
  const byCommune = new Map<number, CommuneRisk>(
    riskData.map((r) => [r.comuna, r]),
  );

  return segments.map((seg) => ({
    id: seg.id,
    distanceMeters: seg.distanceMeters,
    riskVariables: resolveRiskVariables(seg.communeId, byCommune),
  }));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolveRiskVariables(
  communeId: number | null,
  byCommune: Map<number, CommuneRisk>,
): RiskDerivativeInput {
  if (communeId === null) return FALLBACK_RISK_VARIABLES;
  const entry = byCommune.get(communeId);
  if (!entry) return FALLBACK_RISK_VARIABLES;

  return {
    criminalidad: entry.criminalidad,
    seguridad: entry.seguridad,
    vigilancia: entry.vigilancia,
    iluminacion: entry.iluminacion,
    flujoPersonas: entry.flujoPersonas,
  };
}
