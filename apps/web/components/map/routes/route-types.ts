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
   * Riesgo acumulado al final de este segmento.
   * La grafica Euler y el resumen final usan estos valores acumulados.
   * El mapa colorea cada tramo con localRiskLevel.
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
   * Condicion inicial Euler R(0), resuelta en el punto de origen real de la ruta.
   */
  initialRiskScore: number;
  initialRiskLevel: RouteRiskLevel;

  /**
   * Riesgo acumulado final del recorrido.
   */
  finalRiskScore: number;
  finalRiskLevel: RouteRiskLevel;

  mode: "real";

  segments: RouteSegment[];
}
