import type { RouteAnalysis } from "../route-types";
import { MOCK_ROUTE_ANALYSIS } from "../mock-route";

export interface AnalyzeDemoRouteInput {
  origin: string;
  destination: string;
}

export function analyzeDemoRoute(input: AnalyzeDemoRouteInput): RouteAnalysis {
  return {
    ...MOCK_ROUTE_ANALYSIS,
    originLabel: input.origin,
    destinationLabel: input.destination,
    mode: "demo",
  };
}
