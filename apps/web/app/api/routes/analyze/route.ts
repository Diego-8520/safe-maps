import { NextRequest, NextResponse } from "next/server";
import { analyzeDemoRoute } from "@/components/map/routes/services/analyze-demo-route";
import { geocodeAddress, getDrivingRoute } from "@/lib/openroute/openroute-client";
import { normalizeOpenRouteResponse } from "@/lib/routes/normalize-openroute-route";
import {
  OrsApiKeyMissingError,
  OrsGeocodingError,
  OrsRoutingError,
  OrsNetworkError,
} from "@/lib/openroute/openroute-errors";
import { loadCommunesRisk } from "@/lib/risk/load-communes-risk";
import { calculateEulerAccumulatedRouteRisk } from "@/lib/risk/euler-accumulated-route-risk";
import type { RouteAnalysis } from "@/components/map/routes/route-types";

async function logEulerComparison(route: RouteAnalysis): Promise<void> {
  try {
    const riskData = await loadCommunesRisk();
    const euler = calculateEulerAccumulatedRouteRisk(route, riskData);
    if (process.env.NODE_ENV !== "production") {
      console.log("[safe-maps] risk-model-comparison", {
        mode: route.mode,
        segments: route.segments.length,
        preliminary: {
          finalRiskScore: route.finalRiskScore,
          finalRiskLevel: route.finalRiskLevel,
        },
        euler: {
          finalRiskScore: euler.finalRiskScore,
          finalRiskLevel: euler.finalRiskLevel,
        },
      });
    }
  } catch {
    // Comparison is observability-only; never propagate errors to the caller.
  }
}

interface AnalyzeRouteRequest {
  origin: string;
  destination: string;
  mode?: "demo" | "real";
}

interface AnalyzeRouteErrorResponse {
  error: string;
}

export async function POST(req: NextRequest) {
  let body: Partial<AnalyzeRouteRequest>;
  try {
    body = (await req.json()) as Partial<AnalyzeRouteRequest>;
  } catch {
    return NextResponse.json<AnalyzeRouteErrorResponse>(
      { error: "Error al procesar la solicitud." },
      { status: 400 },
    );
  }

  const { origin, destination, mode } = body;

  if (typeof origin !== "string" || !origin.trim()) {
    return NextResponse.json<AnalyzeRouteErrorResponse>(
      { error: "El campo 'origin' es requerido y no puede estar vacío." },
      { status: 400 },
    );
  }

  if (typeof destination !== "string" || !destination.trim()) {
    return NextResponse.json<AnalyzeRouteErrorResponse>(
      { error: "El campo 'destination' es requerido y no puede estar vacío." },
      { status: 400 },
    );
  }

  if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
    return NextResponse.json<AnalyzeRouteErrorResponse>(
      { error: "El origen y el destino deben ser diferentes." },
      { status: 400 },
    );
  }

  if (mode === "real") {
    try {
      const [originCoords, destinationCoords] = await Promise.all([
        geocodeAddress(origin.trim()),
        geocodeAddress(destination.trim()),
      ]);

      const orsResponse = await getDrivingRoute(originCoords, destinationCoords);
      const route = await normalizeOpenRouteResponse(orsResponse, origin.trim(), destination.trim());

      void logEulerComparison(route);
      return NextResponse.json(route);
    } catch (err) {
      if (err instanceof OrsApiKeyMissingError) {
        return NextResponse.json<AnalyzeRouteErrorResponse>(
          { error: err.message },
          { status: 500 },
        );
      }
      if (err instanceof OrsGeocodingError) {
        return NextResponse.json<AnalyzeRouteErrorResponse>(
          { error: err.message },
          { status: 422 },
        );
      }
      if (err instanceof OrsRoutingError) {
        return NextResponse.json<AnalyzeRouteErrorResponse>(
          { error: err.message },
          { status: 422 },
        );
      }
      if (err instanceof OrsNetworkError) {
        return NextResponse.json<AnalyzeRouteErrorResponse>(
          { error: err.message },
          { status: 503 },
        );
      }
      return NextResponse.json<AnalyzeRouteErrorResponse>(
        { error: "Error al analizar la ruta." },
        { status: 500 },
      );
    }
  }

  // mode === "demo" or undefined
  const route = analyzeDemoRoute({
    origin: origin.trim(),
    destination: destination.trim(),
  });

  void logEulerComparison(route);
  return NextResponse.json(route);
}
