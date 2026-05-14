import type { RouteRiskLevel } from "@/components/map/routes/route-types";

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
