import type { RouteAnalysis } from "../route-types";

export type RouteProviderMode = "demo" | "real";

export interface AnalyzeRouteInput {
  origin: string;
  destination: string;
  mode?: RouteProviderMode;
}

export interface RouteProvider {
  analyze(input: AnalyzeRouteInput): Promise<RouteAnalysis>;
}
