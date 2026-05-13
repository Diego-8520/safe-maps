import type { RiskLevel } from "./types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

export function getRiskLevelLabel(level: RiskLevel): string {
  return RISK_LABELS[level];
}

export function isRiskLevel(v: unknown): v is RiskLevel {
  return v === "low" || v === "medium" || v === "high";
}
