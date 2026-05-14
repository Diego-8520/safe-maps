/**
 * Temporal scaffolding types for future risk dataset versioning and time-aware risk queries.
 *
 * No temporal logic is active in the pipeline today. These types prepare the architecture
 * for historical datasets, time-of-day risk variation, and period-specific model runs.
 */

/** Granularity levels at which temporal risk data can be captured or queried. */
export type RiskTimeGranularity = "hourly" | "daytime" | "weekly" | "monthly" | "annual";

/**
 * A named contiguous block of hours within a day.
 * Used to select risk profiles calibrated for specific time periods (e.g., "Nocturno").
 */
export interface TimeWindow {
  /** Human-readable label, e.g. "Nocturno", "Diurno", "Pico mañana" */
  label: string;
  /** Inclusive start hour (0–23) */
  startHour: number;
  /** Exclusive end hour (0–23). May wrap past midnight if startHour > endHour. */
  endHour: number;
}

/**
 * A calendar period identifying a specific dataset snapshot.
 * Datasets can be annual or semi-annual.
 */
export interface DatasetPeriod {
  year: number;
  /** Optional semester. 1 = Jan–Jun, 2 = Jul–Dec. Omit for full-year datasets. */
  semester?: 1 | 2;
  /** Short human-readable label, e.g. "2023-S1", "2024" */
  label: string;
}

/**
 * Resolved temporal context for a risk query.
 * Carries the active TimeWindow and DatasetPeriod if any; isDefault = true
 * means the pipeline is using the static present-day dataset with no time filtering.
 */
export interface RiskTemporalContext {
  timeWindow?: TimeWindow;
  datasetPeriod?: DatasetPeriod;
  /** True when no temporal context was specified — pipeline uses current static data. */
  isDefault: boolean;
}

/**
 * Pointer to a specific historical dataset file for a given period.
 * Future use: select the correct comunas-risk-YYYY.json when multiple snapshots exist.
 */
export interface AnnualDatasetReference {
  period: DatasetPeriod;
  /** Relative path from public/data/, e.g. "comunas-risk-2023.json" */
  sourceFile: string;
  description?: string;
}

/**
 * Metadata attached to a risk snapshot captured at a specific point in time.
 * Future use: audit trail for stored RouteAnalysis results in Supabase.
 */
export interface RiskSnapshotMetadata {
  /** ISO 8601 timestamp of when this snapshot was generated */
  capturedAt: string;
  datasetPeriod: DatasetPeriod;
  /** Model version that produced this snapshot, e.g. "euler-v1" */
  modelVersion: string;
  /** True if risk values come from simulated/synthetic data, not official sources */
  isSimulated: boolean;
}
