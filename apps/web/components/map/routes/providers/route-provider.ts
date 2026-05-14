import type { RouteAnalysis } from "../route-types";
import type { AnalyzeRouteInput } from "./route-provider-types";
import { apiRouteProvider } from "./api-route-provider";

export async function analyzeRoute(input: AnalyzeRouteInput): Promise<RouteAnalysis> {
  return apiRouteProvider.analyze(input);
}
