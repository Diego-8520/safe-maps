import type { RouteProvider, AnalyzeRouteInput } from "./route-provider-types";
import type { RouteAnalysis } from "../route-types";

/**
 * Proveedor de rutas server-side vía /api/routes/analyze.
 * Preparado para cuando OpenRouteService esté implementado en el endpoint.
 * Activar en route-provider.ts reemplazando demoRouteProvider para mode "real".
 */
export const apiRouteProvider: RouteProvider = {
  async analyze(input: AnalyzeRouteInput): Promise<RouteAnalysis> {
    const response = await fetch("/api/routes/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: input.origin,
        destination: input.destination,
        mode: input.mode ?? "real",
      }),
    });

    const data = (await response.json()) as { error?: string } & Partial<RouteAnalysis>;

    if (!response.ok) {
      throw new Error(data.error ?? "Error al analizar la ruta.");
    }

    return data as RouteAnalysis;
  },
};
