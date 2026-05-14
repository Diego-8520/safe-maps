/**
 * TODO: Fallback values for temporal risk resolution.
 *
 * Future implementation will provide:
 * - DEFAULT_TIME_WINDOW: active window used when no time context is specified
 * - DEFAULT_DATASET_PERIOD: the latest available annual or semi-annual snapshot
 * - FALLBACK_CHAIN: ordered list of periods to try when the requested period is missing
 *   (e.g. request 2023-S2 → fall back to 2023 full-year → fall back to latest available)
 *
 * These constants are consumed by resolveRiskTemporalContext() and the repository layer.
 * They are exported here to centralize temporal defaults and avoid magic values scattered
 * across the codebase.
 *
 * Current state: typed with placeholder values representing the present-day defaults.
 * No fallback chain logic is active yet.
 */

import type { TimeWindow, DatasetPeriod } from "@/lib/types/time";

/** Daytime window — active when no explicit time context is provided. */
export const DEFAULT_TIME_WINDOW: TimeWindow = {
  label: "Diurno",
  startHour: 6,
  endHour: 22,
};

/** Nocturnal window — higher risk, to be calibrated with real data. */
export const NOCTURNAL_TIME_WINDOW: TimeWindow = {
  label: "Nocturno",
  startHour: 22,
  endHour: 6,
};

/**
 * Default dataset period used when no temporal context is specified.
 * Update this constant when a new annual dataset is ingested.
 */
export const DEFAULT_DATASET_PERIOD: DatasetPeriod = {
  year: 2024,
  label: "2024",
};
