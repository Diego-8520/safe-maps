"use client";

import { useState } from "react";
import MapLibreView from "@/components/map/map-libre-view";
import RiskLegend from "@/components/map/risk-legend";
import MapSidebar from "@/components/map/sidebar/map-sidebar";
import type { EnrichedFeatureProperties } from "@/components/map/types";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import { analyzeRoute } from "@/components/map/routes/providers/route-provider";
import { validateRouteInput } from "@/components/map/routes/services/route-validation";

function MapToolbar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#060d1a]/80 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
        <span className="text-cyan-400">●</span>
        <span>Cali · Valle del Cauca · Colombia</span>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-600">
        <span>Zoom 12</span>
        <span>3.4516° N · 76.5320° O</span>
      </div>
    </div>
  );
}

function CoordWatermark() {
  return (
    <p className="absolute bottom-4 left-4 text-[9px] font-mono text-slate-700 pointer-events-none z-10">
      3.4516° N · 76.5320° O
    </p>
  );
}

function MapArea({
  onCommuneSelect,
  route,
}: {
  onCommuneSelect: (c: EnrichedFeatureProperties) => void;
  route: RouteAnalysis | null;
}) {
  return (
    <main className="flex-1 relative min-h-[55vh] md:min-h-0 overflow-hidden">
      <MapLibreView onCommuneSelect={onCommuneSelect} route={route} />
      <MapToolbar />
      <RiskLegend />
      <CoordWatermark />
    </main>
  );
}

export default function MapLayout() {
  const [selected, setSelected] = useState<EnrichedFeatureProperties | null>(null);
  const [route, setRoute] = useState<RouteAnalysis | null>(null);
  const [origin, setOrigin] = useState("Centro, Cali");
  const [destination, setDestination] = useState("Aguablanca, Cali");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isAnalyzingRoute, setIsAnalyzingRoute] = useState(false);
  const [routeMode, setRouteMode] = useState<"demo" | "real">("demo");

  async function handleAnalyzeRoute() {
    const validation = validateRouteInput(origin, destination);

    if (!validation.valid) {
      setRouteError(validation.error);
      setRoute(null);
      return;
    }

    setIsAnalyzingRoute(true);
    setRouteError(null);

    try {
      const analyzedRoute = await analyzeRoute({
        origin: origin.trim(),
        destination: destination.trim(),
        mode: routeMode,
      });
      setRoute(analyzedRoute);
    } catch (err) {
      setRoute(null);
      if (routeMode === "real") {
        const message = err instanceof Error ? err.message : null;
        setRouteError(
          message ?? "No se pudo calcular la ruta real. Verifica las direcciones e intenta nuevamente.",
        );
      } else {
        setRouteError("No se pudo analizar la ruta. Intenta nuevamente.");
      }
    } finally {
      setIsAnalyzingRoute(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
      <MapSidebar
        selected={selected}
        route={route}
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onAnalyzeRoute={handleAnalyzeRoute}
        routeError={routeError}
        isAnalyzingRoute={isAnalyzingRoute}
        routeMode={routeMode}
        onRouteModeChange={setRouteMode}
      />
      <MapArea onCommuneSelect={(c) => setSelected(c)} route={route} />
    </div>
  );
}
