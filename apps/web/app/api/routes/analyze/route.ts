import { NextRequest, NextResponse } from "next/server";
import { analyzeDemoRoute } from "@/components/map/routes/services/analyze-demo-route";

interface AnalyzeRouteRequest {
  origin: string;
  destination: string;
  mode?: "demo" | "real";
}

interface AnalyzeRouteErrorResponse {
  error: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalyzeRouteRequest>;

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
      return NextResponse.json<AnalyzeRouteErrorResponse>(
        { error: "El proveedor de rutas reales todavía no está implementado." },
        { status: 501 },
      );
    }

    // mode === "demo" or undefined
    const route = analyzeDemoRoute({
      origin: origin.trim(),
      destination: destination.trim(),
    });

    return NextResponse.json(route);
  } catch {
    return NextResponse.json<AnalyzeRouteErrorResponse>(
      { error: "Error al procesar la solicitud." },
      { status: 400 },
    );
  }
}
