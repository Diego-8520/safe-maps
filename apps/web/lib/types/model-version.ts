/**
 * Canonical types for the risk model versioning system.
 *
 * RiskModelVersion is the discriminant used to select the correct coefficient set
 * and integration strategy. Extend the union as new model versions are introduced.
 */

/** Identifier for a supported risk model version. */
export type RiskModelVersion = "euler-v1";
// When a new model version ships: add it to this union, e.g. "euler-v2" | "logistic-v1"

/** Direction a variable pushes the risk derivative: positive or negative contribution. */
export type VariableDirection = "increase" | "decrease";

/** Per-variable metadata entry for UI display, documentation, and model introspection. */
export interface RiskModelVariableMeta {
  /** Mathematical symbol used in the formula, e.g. "C", "S" */
  symbol: string;
  /** Field name in CommuneRisk, e.g. "criminalidad", "seguridad" */
  field: string;
  /** Coefficient key in the coefficient set, e.g. "a", "b" */
  coefficient: string;
  /** Numeric coefficient value */
  value: number;
  /** Whether this variable increases or decreases the risk derivative */
  direction: VariableDirection;
}

/**
 * A named map of coefficient keys to numeric values.
 * Keys correspond to the symbols used in the model formula.
 * e.g. { a: 30, b: 15, d: 10, e: 10, h: 8 } for euler-v1.
 */
export interface RiskModelCoefficientSet {
  [key: string]: number;
}

/**
 * Full metadata descriptor for a risk model version.
 * Used by the model registry, UI panels, and documentation generation.
 */
export interface RiskModelMetadata {
  version: RiskModelVersion;
  name: string;
  description: string;
  coefficients: RiskModelCoefficientSet;
  variables: readonly RiskModelVariableMeta[];
}
