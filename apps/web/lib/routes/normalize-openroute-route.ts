import type { RouteAnalysis, RouteSegment, RouteCoordinate } from "@/components/map/routes/route-types";
import type { OrsDirectionsResponse } from "@/lib/openroute/openroute-types";

// Placeholder values until spatial intersection with comunas + risk model is implemented.
const PLACEHOLDER_RISK_SCORE = 50;
const PLACEHOLDER_RISK_LEVEL = "medium" as const;

const TARGET_SEGMENTS = 6;

function splitCoordinates(
  coords: [number, number][],
  n: number,
): [number, number][][] {
  if (coords.length < 2) return [coords];
  const count = Math.min(n, coords.length - 1);
  const result: [number, number][][] = [];
  const step = Math.floor((coords.length - 1) / count);

  for (let i = 0; i < count; i++) {
    const start = i * step;
    const end = i === count - 1 ? coords.length - 1 : (i + 1) * step;
    result.push(coords.slice(start, end + 1));
  }

  return result;
}

function toRouteCoordinates(coords: [number, number][]): RouteCoordinate[] {
  return coords.map(([lng, lat]) => ({ lng, lat }));
}

export function normalizeOpenRouteResponse(
  response: OrsDirectionsResponse,
  originLabel: string,
  destinationLabel: string,
): RouteAnalysis {
  const feature = response.features[0];
  const { geometry, properties } = feature;
  const allCoords = geometry.coordinates;
  const { distance, duration } = properties.summary;

  const chunks = splitCoordinates(allCoords, TARGET_SEGMENTS);

  const segments: RouteSegment[] = chunks.map((chunk, index) => {
    const segmentDistance = Math.round((chunk.length / allCoords.length) * distance);

    return {
      id: `real-seg-${String(index + 1).padStart(3, "0")}`,
      coordinates: toRouteCoordinates(chunk),
      distanceMeters: segmentDistance,
      communeId: null,
      localRiskScore: PLACEHOLDER_RISK_SCORE,
      localRiskLevel: PLACEHOLDER_RISK_LEVEL,
      accumulatedRiskScore: PLACEHOLDER_RISK_SCORE,
      accumulatedRiskLevel: PLACEHOLDER_RISK_LEVEL,
    };
  });

  return {
    id: `real-route-${Date.now()}`,
    originLabel,
    destinationLabel,
    totalDistanceMeters: Math.round(distance),
    estimatedDurationMinutes: Math.round(duration / 60),
    finalRiskScore: PLACEHOLDER_RISK_SCORE,
    finalRiskLevel: PLACEHOLDER_RISK_LEVEL,
    mode: "real",
    segments,
  };
}
