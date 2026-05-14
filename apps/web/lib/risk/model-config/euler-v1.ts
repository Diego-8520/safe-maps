import type { RiskModelMetadata } from "@/lib/types/model-version";

export const EULER_V1_MODEL_CODE = "euler-v1" as const;

export const EULER_V1_MODEL_NAME = "Euler v1 — Modelo diferencial lineal";

export const EULER_V1_MODEL_DESCRIPTION =
  "Integración numérica por método de Euler. " +
  "dR/dx = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃ " +
  "donde cada variable se normaliza a [0, 1]. " +
  "Coeficientes provisionales — pendientes de calibración con datos reales.";

/**
 * Coefficients for the linear risk derivative dR/dx.
 * Calibration reference (comunas-risk.json simulated data):
 *   High-risk   commune 13: C=85, S=30, V=35, I=40, F=72 → dR/dx ≈ +19.3
 *   Low-risk    commune 22: C=15, S=80, V=75, I=82, F=35 → dR/dx ≈ -20.4
 *   Medium-risk commune  1: C=52, S=55, V=50, I=58, F=60 → dR/dx ≈  +1.4
 */
export const EULER_V1_COEFFICIENTS = {
  a: 30, // criminalidad   — strongest positive driver
  b: 15, // seguridad      — primary negative driver
  d: 10, // vigilancia     — secondary negative driver
  e: 10, // iluminacion    — secondary negative driver
  h: 8,  // flujoPersonas  — amplifier in high-risk corridors
} as const;

export type Euler_V1_Coefficients = typeof EULER_V1_COEFFICIENTS;

/** Per-variable metadata for UI display and documentation. */
export const EULER_V1_VARIABLE_META = [
  { symbol: "C", field: "criminalidad",  coefficient: "a", value: 30, direction: "increase" },
  { symbol: "S", field: "seguridad",     coefficient: "b", value: 15, direction: "decrease" },
  { symbol: "V", field: "vigilancia",    coefficient: "d", value: 10, direction: "decrease" },
  { symbol: "I", field: "iluminacion",   coefficient: "e", value: 10, direction: "decrease" },
  { symbol: "F", field: "flujoPersonas", coefficient: "h", value: 8,  direction: "increase" },
] as const;

// VariableDirection canonical definition lives in lib/types/model-version.
// Re-exported here for backward compatibility with existing imports.
export type { VariableDirection } from "@/lib/types/model-version";

/**
 * Bundled model descriptor conforming to RiskModelMetadata.
 * Use this when you need the full model profile (UI panels, model registry, docs generation).
 * Use EULER_V1_COEFFICIENTS directly when you only need the coefficient values.
 */
export const EULER_V1_MODEL_METADATA: RiskModelMetadata = {
  version: EULER_V1_MODEL_CODE,
  name: EULER_V1_MODEL_NAME,
  description: EULER_V1_MODEL_DESCRIPTION,
  coefficients: { ...EULER_V1_COEFFICIENTS },
  variables: [...EULER_V1_VARIABLE_META],
};
