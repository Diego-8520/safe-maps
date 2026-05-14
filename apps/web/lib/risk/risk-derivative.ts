/**
 * Preliminary risk-derivative model — first layer of the differential risk pipeline.
 *
 * Computes dR/dx: the instantaneous rate of change of accumulated risk
 * with respect to path distance.
 *
 *   dR/dx = a·C − b·S − d·V − e·I + h·F
 *
 * Variables (all in [0, 100] from comunas-risk.json, normalized to [0, 1] internally):
 *   C = criminalidad   — primary risk driver (increases risk)
 *   S = seguridad      — formal security presence (decreases risk)
 *   V = vigilancia     — physical deterrence / watch (decreases risk)
 *   I = iluminacion    — visibility deterrent (decreases risk)
 *   F = flujoPersonas  — pedestrian flow (amplifies risk in dangerous corridors)
 *
 * Return unit: risk-points per kilometer.
 * Intended Euler usage: R(x + Δx) = clamp(R(x) + dR/dx · Δx_km, 0, 100)
 *
 * NOT integrated into the production pipeline yet.
 * Next step: replace calculatePreliminaryAccumulatedRisk with an Euler integrator
 * that calls this function per segment.
 */

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
 * Coefficients calibrated so that extreme communes produce ±15–25 risk-pts/km.
 * Provisional — adjust when real field measurements are available.
 *
 * Calibration reference (from comunas-risk.json):
 *   High-risk   (commune 13): C=85, S=30, V=35, I=40, F=72 → dR/dx ≈ +19.3
 *   Low-risk    (commune 22): C=15, S=80, V=75, I=82, F=35 → dR/dx ≈ -20.4
 *   Medium-risk (commune 1):  C=52, S=55, V=50, I=58, F=60 → dR/dx ≈  +1.4
 */
export const RISK_DERIVATIVE_COEFFICIENTS = {
  a: 30, // criminalidad — strongest positive driver
  b: 15, // seguridad    — primary negative driver
  d: 10, // vigilancia   — secondary negative driver
  e: 10, // iluminacion  — secondary negative driver
  h: 8,  // flujoPersonas — amplifier in high-risk zones
} as const;

/**
 * Returns the instantaneous risk-change rate dR/dx in risk-points per kilometer.
 *
 * Pure function: no I/O, no side effects, no React or MapLibre dependencies.
 * Safe to call in any environment (server, client, worker, test runner).
 */
export function calculateRiskDerivative(input: RiskDerivativeInput): number {
  const { a, b, d, e, h } = RISK_DERIVATIVE_COEFFICIENTS;

  // Normalize [0, 100] → [0, 1] before applying coefficients.
  const C = input.criminalidad  / 100;
  const S = input.seguridad     / 100;
  const V = input.vigilancia    / 100;
  const I = input.iluminacion   / 100;
  const F = input.flujoPersonas / 100;

  return a * C - b * S - d * V - e * I + h * F;
}
