import type { RouteRiskLevel } from "@/lib/types/risk";

export interface CommuneRisk {
  comuna: number;
  riskScore: number;
  riskLevel: RouteRiskLevel;
  criminalidad: number;
  seguridad: number;
  vigilancia: number;
  iluminacion: number;
  flujoPersonas: number;
}
