import type { RouteAnalysis, RouteSegment, RouteCoordinate } from "@/components/map/routes/route-types";
import type { OrsDirectionsResponse } from "@/lib/openroute/openroute-types";
import { segmentByDistance } from "@/lib/routes/route-segmentation";
import { findCommuneForPoint } from "@/lib/geo/find-commune-for-point";
import { findRiskByCommune } from "@/lib/risk/find-risk-by-commune";
import { localCommuneRepository } from "@/lib/repositories/local-commune-repository";
import { localCommuneRiskRepository } from "@/lib/repositories/local-commune-risk-repository";
import { calculateEulerAccumulatedRouteRisk } from "@/lib/risk/euler-accumulated-route-risk";

function toRouteCoordinates(coords: [number, number][]): RouteCoordinate[] {
  return coords.map(([lng, lat]) => ({ lng, lat }));
}

function midpointOf(coords: [number, number][]): [number, number] {
  return coords[Math.floor(coords.length / 2)];
}

export async function normalizeOpenRouteResponse(
  response: OrsDirectionsResponse,
  originLabel: string,
  destinationLabel: string,
): Promise<RouteAnalysis> {
  const feature = response.features[0];

  if (!feature) {
    throw new Error("OpenRouteService returned an empty route response.");
  }

  const allCoords = feature.geometry.coordinates;

  if (allCoords.length < 2) {
    throw new Error(
      `OpenRouteService returned a route with only ${allCoords.length} coordinate(s).`,
    );
  }

  const { distance, duration } = feature.properties.summary;

  const chunks = segmentByDistance(allCoords);

  const [features, riskData] = await Promise.all([
    localCommuneRepository.getFeatures(),
    localCommuneRiskRepository.getAll(),
  ]);

  const rawSegments: RouteSegment[] = chunks.map((chunk, index) => {
    const midpoint = midpointOf(chunk.coords);
    const communeId = findCommuneForPoint(midpoint, features);
    const { localRiskScore, localRiskLevel } = findRiskByCommune(communeId, riskData);

    return {
      id: `real-seg-${String(index + 1).padStart(3, "0")}`,
      coordinates: toRouteCoordinates(chunk.coords),
      distanceMeters: chunk.distanceMeters,
      communeId,
      localRiskScore,
      localRiskLevel,
      // Filled in by calculateEulerAccumulatedRouteRisk below.
      accumulatedRiskScore: 0,
      accumulatedRiskLevel: "medium" as const,
    };
  });

  // riskModelVersion: euler-v1
  const rawRoute: RouteAnalysis = {
    id: `real-route-${Date.now()}`,
    originLabel,
    destinationLabel,
    totalDistanceMeters: Math.round(distance),
    estimatedDurationMinutes: Math.round(duration / 60),
    finalRiskScore: 50,
    finalRiskLevel: "medium",
    mode: "real",
    segments: rawSegments,
  };

  return calculateEulerAccumulatedRouteRisk(rawRoute, riskData);
}
