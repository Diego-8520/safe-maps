import { analyzeDemoRoute } from "../services/analyze-demo-route";
import type { RouteProvider, AnalyzeRouteInput } from "./route-provider-types";
import type { RouteAnalysis } from "../route-types";

export const demoRouteProvider: RouteProvider = {
  async analyze(input: AnalyzeRouteInput): Promise<RouteAnalysis> {
    return analyzeDemoRoute({
      origin: input.origin,
      destination: input.destination,
    });
  },
};
