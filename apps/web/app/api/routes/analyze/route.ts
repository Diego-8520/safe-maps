import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress, getDrivingRoute } from "@/lib/openroute/openroute-client";
import { normalizeOpenRouteResponse } from "@/lib/routes/normalize-openroute-route";
import {
  OrsApiKeyMissingError,
  OrsGeocodingError,
  OrsRoutingError,
  OrsNetworkError,
} from "@/lib/openroute/openroute-errors";

interface AnalyzeRouteRequest {
  origin: string;
  destination: string;
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

  const { origin, destination } = body;

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

  try {
    const [originCoords, destinationCoords] = await Promise.all([
      geocodeAddress(origin.trim()),
      geocodeAddress(destination.trim()),
    ]);

    const orsResponse = await getDrivingRoute(originCoords, destinationCoords);
    const route = await normalizeOpenRouteResponse(orsResponse, origin.trim(), destination.trim());

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
