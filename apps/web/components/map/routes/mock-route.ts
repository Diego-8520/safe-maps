/**
 * DEMO DATA — NOT A REAL ROUTE.
 *
 * La geometría es aproximada y no sigue calles reales.
 * Será reemplazada por geometría real calculada por OpenRouteService
 * cruzada con comunas de Cali para obtener riesgo local y acumulado.
 *
 * Propósito: validar el contrato visual de RouteAnalysis antes de conectar el backend.
 */
import type { RouteAnalysis } from "./route-types";

export const MOCK_ROUTE_ANALYSIS: RouteAnalysis = {
  id: "demo-route-001",
  originLabel: "Visualización simulada — origen demo",
  destinationLabel: "Visualización simulada — destino demo",
  totalDistanceMeters: 5200,
  estimatedDurationMinutes: 15,
  finalRiskScore: 81,
  finalRiskLevel: "high",
  mode: "demo",
  segments: [
    {
      id: "seg-001",
      coordinates: [
        { lng: -76.532, lat: 3.4516 },
        { lng: -76.528, lat: 3.4500 },
        { lng: -76.524, lat: 3.4490 },
      ],
      distanceMeters: 700,
      communeId: 3,
      localRiskScore: 55,
      localRiskLevel: "medium",
      accumulatedRiskScore: 55,
      accumulatedRiskLevel: "medium",
    },
    {
      id: "seg-002",
      coordinates: [
        { lng: -76.524, lat: 3.4490 },
        { lng: -76.520, lat: 3.4475 },
        { lng: -76.516, lat: 3.4460 },
      ],
      distanceMeters: 700,
      communeId: 4,
      localRiskScore: 35,
      localRiskLevel: "low",
      accumulatedRiskScore: 48,
      accumulatedRiskLevel: "medium",
    },
    {
      id: "seg-003",
      coordinates: [
        { lng: -76.516, lat: 3.4460 },
        { lng: -76.512, lat: 3.4445 },
        { lng: -76.508, lat: 3.4430 },
      ],
      distanceMeters: 700,
      communeId: 5,
      localRiskScore: 30,
      localRiskLevel: "low",
      accumulatedRiskScore: 40,
      accumulatedRiskLevel: "low",
    },
    {
      id: "seg-004",
      coordinates: [
        { lng: -76.508, lat: 3.4430 },
        { lng: -76.504, lat: 3.4415 },
        { lng: -76.500, lat: 3.4400 },
      ],
      distanceMeters: 700,
      communeId: 9,
      localRiskScore: 75,
      localRiskLevel: "high",
      accumulatedRiskScore: 52,
      accumulatedRiskLevel: "medium",
    },
    {
      id: "seg-005",
      coordinates: [
        { lng: -76.500, lat: 3.4400 },
        { lng: -76.498, lat: 3.4390 },
        { lng: -76.496, lat: 3.4378 },
      ],
      distanceMeters: 700,
      communeId: 13,
      localRiskScore: 82,
      localRiskLevel: "high",
      accumulatedRiskScore: 67,
      accumulatedRiskLevel: "medium",
    },
    {
      id: "seg-006",
      coordinates: [
        { lng: -76.496, lat: 3.4378 },
        { lng: -76.494, lat: 3.4368 },
        { lng: -76.492, lat: 3.4360 },
      ],
      distanceMeters: 700,
      communeId: 13,
      localRiskScore: 88,
      localRiskLevel: "high",
      accumulatedRiskScore: 81,
      accumulatedRiskLevel: "high",
    },
  ],
};
