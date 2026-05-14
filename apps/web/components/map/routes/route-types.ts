import type { RouteRiskLevel } from "@/lib/types/risk";
export type { RouteRiskLevel };

export interface RouteCoordinate {
  lng: number;
  lat: number;
}

export interface RouteSegment {
  id: string;
  coordinates: RouteCoordinate[];
  distanceMeters: number;

  /**
   * Comuna o zona urbana asociada al segmento.
   * En el futuro vendrá del cruce espacial entre la ruta real y las comunas.
   */
  communeId: number | null;

  /**
   * Riesgo local del segmento según las condiciones urbanas de la zona atravesada.
   * No representa el riesgo acumulado del usuario.
   */
  localRiskScore: number;
  localRiskLevel: RouteRiskLevel;

  /**
   * Riesgo acumulado hasta este segmento.
   * Este es el valor que debe usarse para colorear la ruta.
   */
  accumulatedRiskScore: number;
  accumulatedRiskLevel: RouteRiskLevel;
}

export interface RouteAnalysis {
  id: string;
  originLabel: string;
  destinationLabel: string;
  totalDistanceMeters: number;
  estimatedDurationMinutes: number;

  /**
   * Riesgo acumulado final del recorrido.
   */
  finalRiskScore: number;
  finalRiskLevel: RouteRiskLevel;

  mode: "real";

  segments: RouteSegment[];
}
