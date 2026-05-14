/**
 * Risk-derivative computation — first layer of the differential risk pipeline.
 *
 * Computes dR/dx: the instantaneous rate of change of accumulated risk
 * with respect to path distance.
 *
 *   dR/dx = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃
 *
 * Variables (all in [0, 100] from comunas-risk.json, normalised to [0, 1] internally):
 *   C = criminalidad   — primary risk driver (increases risk)
 *   S = seguridad      — formal security presence (decreases risk)
 *   V = vigilancia     — physical deterrence / watch (decreases risk)
 *   I = iluminacion    — visibility deterrent (decreases risk)
 *   F = flujoPersonas  — pedestrian flow (amplifies risk in dangerous corridors)
 *
 * Return unit: risk-points per kilometre.
 * Euler usage: R(x + Δx) = clamp(R(x) + dR/dx · Δx_km, 0, 100)
 */

import { EULER_V1_COEFFICIENTS } from "@/lib/risk/model-config/euler-v1";

export interface RiskDerivativeInput {
  /** Urban crime index for the commune [0, 100] */
  criminalidad: number;
  /** Formal security presence for the commune [0, 100] */
  seguridad: number;
  /** Physical surveillance / watch level [0, 100] */
  vigilancia: number;
  /** Street illumination quality [0, 100] */
  iluminacion: number;
  /** Pedestrian flow intensity [0, 100] */
  flujoPersonas: number;
}

/**
 * Returns the instantaneous risk-change rate dR/dx in risk-points per kilometre.
 *
 * Pure function: no I/O, no side effects, no React or MapLibre dependencies.
 * Safe to call in any environment (server, client, worker, test runner).
 */
export function calculateRiskDerivative(input: RiskDerivativeInput): number {
  const { a, b, d, e, h } = EULER_V1_COEFFICIENTS;

  // Normalise [0, 100] → [0, 1] before applying coefficients.
  const C = input.criminalidad  / 100;
  const S = input.seguridad     / 100;
  const V = input.vigilancia    / 100;
  const I = input.iluminacion   / 100;
  const F = input.flujoPersonas / 100;

  return a * C - b * S - d * V - e * I + h * F;
}
