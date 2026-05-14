import type { RouteRiskLevel } from "@/lib/types/risk";
import type { CommuneRisk } from "@/lib/types/commune-risk";

// Aliases for backward compatibility with existing component imports.
// The canonical definitions live in lib/types/.
export type RiskLevel = RouteRiskLevel;
export type CommuneRiskData = CommuneRisk;

export interface CommuneFeatureProperties {
  comuna: number;
  nombre: string;
  shape_leng?: number;
  shape_area?: number;
}

export interface EnrichedFeatureProperties extends CommuneFeatureProperties, CommuneRiskData {}
