"use client";

import { useState, type ReactNode } from "react";
import MapLibreView from "@/components/map/map-libre-view";
import RiskLegend from "@/components/map/risk-legend";
import MapSidebar from "@/components/map/sidebar/map-sidebar";
import MobileMapControls from "@/components/map/mobile/mobile-map-controls";
import MobileBottomSheet from "@/components/map/mobile/mobile-bottom-sheet";
import type { EnrichedFeatureProperties } from "@/components/map/types";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import { analyzeRoute } from "@/components/map/routes/providers/route-provider";
import { validateRouteInput } from "@/components/map/routes/services/route-validation";

// Visible on desktop only — mobile uses MobileMapControls instead.
function MapToolbar() {
  return (
    <div className="hidden md:flex absolute top-0 left-0 right-0 z-10 items-center justify-between px-4 py-2.5 bg-[#060d1a]/80 backdrop-blur-sm border-b border-white/5">
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
  children,
}: {
  onCommuneSelect: (c: EnrichedFeatureProperties) => void;
  route: RouteAnalysis | null;
  children?: ReactNode;
}) {
  return (
    <main className="flex-1 relative overflow-hidden">
      <MapLibreView onCommuneSelect={onCommuneSelect} route={route} />
      <MapToolbar />
      <RiskLegend />
      <CoordWatermark />
      {children}
    </main>
  );
}

export default function MapLayout() {
  const [selected, setSelected] = useState<EnrichedFeatureProperties | null>(
    null,
  );
  const [route, setRoute] = useState<RouteAnalysis | null>(null);
  const [origin, setOrigin] = useState("Centro, Cali");
  const [destination, setDestination] = useState("Aguablanca, Cali");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isAnalyzingRoute, setIsAnalyzingRoute] = useState(false);

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
        mode: "real",
      });
      setRoute(analyzedRoute);
    } catch (err) {
      setRoute(null);
      const message = err instanceof Error ? err.message : null;
      setRouteError(
        message ??
          "No se pudo calcular la ruta. Verifica las direcciones e intenta nuevamente.",
      );
    } finally {
      setIsAnalyzingRoute(false);
    }
  }

  const routeInputProps = {
    origin,
    destination,
    onOriginChange: setOrigin,
    onDestinationChange: setDestination,
    onAnalyzeRoute: handleAnalyzeRoute,
    routeError,
    isAnalyzingRoute,
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:w-80 md:shrink-0 md:h-full">
        <MapSidebar selected={selected} route={route} {...routeInputProps} />
      </div>
      {/* Map — fills all space; on mobile it's the only flex child */}
      <MapArea onCommuneSelect={(c) => setSelected(c)} route={route}>
        {/* Mobile overlays — hidden on desktop */}
        <div className="md:hidden">
          <MobileMapControls {...routeInputProps} />
          <MobileBottomSheet route={route} selected={selected} />
        </div>
      </MapArea>
    </div>
  );
}
