import type { RouteRiskLevel } from "@/lib/types/risk";

// Thresholds derived from comunas-risk.json distribution:
// < 40 → low, 40–69 → medium, ≥ 70 → high.
export function scoreToRiskLevel(score: number): RouteRiskLevel {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}
