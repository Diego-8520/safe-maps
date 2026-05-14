import type { RouteAnalysis, RouteRiskLevel } from "./route-types";

export function routeRiskColor(level: RouteRiskLevel): string {
  const colors: Record<RouteRiskLevel, string> = {
    low:    "#22c55e",
    medium: "#f59e0b",
    high:   "#ef4444",
  };
  return colors[level];
}

export function formatDistanceKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

type RouteSegmentProperties = {
  id: string;
  distanceMeters: number;
  communeId: number | null;
  localRiskScore: number;
  localRiskLevel: RouteRiskLevel;
  accumulatedRiskScore: number;
  accumulatedRiskLevel: RouteRiskLevel;
};

export function buildRouteGeoJson(route: RouteAnalysis): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: route.segments.map((segment) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: segment.coordinates.map((c) => [c.lng, c.lat]),
      },
      properties: {
        id: segment.id,
        distanceMeters: segment.distanceMeters,
        communeId: segment.communeId,
        localRiskScore: segment.localRiskScore,
        localRiskLevel: segment.localRiskLevel,
        accumulatedRiskScore: segment.accumulatedRiskScore,
        accumulatedRiskLevel: segment.accumulatedRiskLevel,
      } satisfies RouteSegmentProperties,
    })),
  };
}
