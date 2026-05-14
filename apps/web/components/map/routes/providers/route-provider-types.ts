import type { RouteAnalysis } from "../route-types";

export interface AnalyzeRouteInput {
  origin: string;
  destination: string;
}

export interface RouteProvider {
  analyze(input: AnalyzeRouteInput): Promise<RouteAnalysis>;
}
