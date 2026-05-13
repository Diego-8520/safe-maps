import type { RouteAnalysis } from "../route-types";
import type { AnalyzeRouteInput } from "./route-provider-types";
import { demoRouteProvider } from "./demo-route-provider";
import { apiRouteProvider } from "./api-route-provider";

export async function analyzeRoute(input: AnalyzeRouteInput): Promise<RouteAnalysis> {
  const mode = input.mode ?? "demo";

  if (mode === "real") {
    return apiRouteProvider.analyze(input);
  }

  return demoRouteProvider.analyze(input);
}
