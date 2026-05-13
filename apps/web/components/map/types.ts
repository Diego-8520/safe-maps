export type RiskLevel = "low" | "medium" | "high";

export interface CommuneRiskData {
  comuna: number;
  riskScore: number;
  riskLevel: RiskLevel;
  criminalidad: number;
  seguridad: number;
  vigilancia: number;
  iluminacion: number;
  flujoPersonas: number;
}

export interface CommuneFeatureProperties {
  comuna: number;
  nombre: string;
  shape_leng?: number;
  shape_area?: number;
}

export interface EnrichedFeatureProperties extends CommuneFeatureProperties, CommuneRiskData {}
