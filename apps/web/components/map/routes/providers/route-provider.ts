import type { RouteAnalysis } from "../route-types";
import type { AnalyzeRouteInput } from "./route-provider-types";
import { demoRouteProvider } from "./demo-route-provider";
// import { apiRouteProvider } from "./api-route-provider";
// Activar cuando OpenRouteService esté implementado en /api/routes/analyze.

export async function analyzeRoute(input: AnalyzeRouteInput): Promise<RouteAnalysis> {
  const mode = input.mode ?? "demo";

  if (mode === "real") {
    throw new Error(
      "[route-provider] El proveedor real todavía no está implementado. Usa mode: 'demo'.",
    );
  }

  return demoRouteProvider.analyze(input);
}
