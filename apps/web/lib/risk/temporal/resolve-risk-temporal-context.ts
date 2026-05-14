/**
 * TODO: Resolve the active temporal context for a risk query.
 *
 * Future implementation will:
 * - Determine the active TimeWindow from the request timestamp
 *   (e.g., return "Nocturno" if the query arrives between 22:00 and 05:59)
 * - Select the most recent DatasetPeriod from the available AnnualDatasetReference registry
 * - Accept an optional override (e.g., from query params for historical analysis)
 * - Return a RiskTemporalContext consumed by the loader or repository layer
 *
 * Pipeline impact when implemented:
 * - localCommuneRiskRepository.getAll() will accept a RiskTemporalContext
 * - It will load the period-specific dataset instead of the static comunas-risk.json
 * - The Euler formula and coefficients do not change — only the input CommuneRisk values differ
 *
 * Current behavior: always returns the default context (no temporal filtering).
 * The pipeline uses the static present-day dataset as-is.
 */

import type { RiskTemporalContext } from "@/lib/types/time";

export function resolveRiskTemporalContext(): RiskTemporalContext {
  return { isDefault: true };
}
