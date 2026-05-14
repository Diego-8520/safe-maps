import type { RouteRiskLevel } from "@/components/map/routes/route-types";
import type { CommuneRisk } from "./risk-types";

const FALLBACK_RISK_SCORE = 50;
const FALLBACK_RISK_LEVEL: RouteRiskLevel = "medium";

export interface LocalRisk {
  localRiskScore: number;
  localRiskLevel: RouteRiskLevel;
}

export function findRiskByCommune(
  communeId: number | null,
  riskData: CommuneRisk[],
): LocalRisk {
  if (communeId === null) {
    return { localRiskScore: FALLBACK_RISK_SCORE, localRiskLevel: FALLBACK_RISK_LEVEL };
  }
  const entry = riskData.find((r) => r.comuna === communeId);
  if (!entry) {
    return { localRiskScore: FALLBACK_RISK_SCORE, localRiskLevel: FALLBACK_RISK_LEVEL };
  }
  return { localRiskScore: entry.riskScore, localRiskLevel: entry.riskLevel };
}
