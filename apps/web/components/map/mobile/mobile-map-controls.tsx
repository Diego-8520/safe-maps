"use client";

import { IconPin, IconFlag, IconRoute } from "@/components/map/ui/map-icons";

interface MobileMapControlsProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAnalyzeRoute: () => void;
  routeError: string | null;
  isAnalyzingRoute: boolean;
  routeMode: "demo" | "real";
  onRouteModeChange: (mode: "demo" | "real") => void;
}

export default function MobileMapControls({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAnalyzeRoute,
  routeError,
  isAnalyzingRoute,
  routeMode,
  onRouteModeChange,
}: MobileMapControlsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-2.5">
      <div className="rounded-2xl bg-[#060d1a]/95 backdrop-blur-md border border-white/10 shadow-2xl p-3 space-y-2">
        {/* Mode toggle */}
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onRouteModeChange("demo")}
            disabled={isAnalyzingRoute}
            className={`flex-1 py-1 transition-colors disabled:cursor-not-allowed ${
              routeMode === "demo"
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Demo
          </button>
          <div className="w-px bg-white/10" />
          <button
            type="button"
            onClick={() => onRouteModeChange("real")}
            disabled={isAnalyzingRoute}
            className={`flex-1 py-1 transition-colors disabled:cursor-not-allowed ${
              routeMode === "real"
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Real
          </button>
        </div>

        {/* Origin */}
        <div className="relative">
          <IconPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400 pointer-events-none" />
          <input
            type="text"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Origen"
            disabled={isAnalyzingRoute}
            className="w-full pl-8 pr-3 py-2 bg-white/4 border border-cyan-500/20 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Destination */}
        <div className="relative">
          <IconFlag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Destino"
            disabled={isAnalyzingRoute}
            className="w-full pl-8 pr-3 py-2 bg-white/4 border border-emerald-500/20 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Analyze button */}
        <button
          type="button"
          onClick={onAnalyzeRoute}
          disabled={isAnalyzingRoute}
          className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-cyan-500"
        >
          <IconRoute className="w-4 h-4" />
          {isAnalyzingRoute ? "Analizando..." : "Analizar ruta"}
        </button>

        {routeError && (
          <p className="text-[11px] font-mono text-red-400 leading-relaxed">{routeError}</p>
        )}
      </div>
    </div>
  );
}
