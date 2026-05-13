import { IconPin, IconFlag, IconRoute } from "@/components/map/ui/map-icons";

interface RouteInputsProps {
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

export default function RouteInputs({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAnalyzeRoute,
  routeError,
  isAnalyzingRoute,
  routeMode,
  onRouteModeChange,
}: RouteInputsProps) {
  return (
    <div className="px-5 py-5 border-b border-white/5 space-y-3">
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Modo de análisis
        </label>
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onRouteModeChange("demo")}
            disabled={isAnalyzingRoute}
            className={`flex-1 py-1.5 transition-colors disabled:cursor-not-allowed ${
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
            className={`flex-1 py-1.5 transition-colors disabled:cursor-not-allowed ${
              routeMode === "real"
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Real
          </button>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Origen
        </label>
        <div className="relative">
          <IconPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          <input
            type="text"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Ej: Universidad del Valle, Cali"
            disabled={isAnalyzingRoute}
            className="w-full pl-9 pr-3 py-2.5 bg-white/4 border border-cyan-500/20 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <div className="flex flex-col gap-0.5">
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
        </div>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Destino
        </label>
        <div className="relative">
          <IconFlag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Ej: Terminal de Transportes, Cali"
            disabled={isAnalyzingRoute}
            className="w-full pl-9 pr-3 py-2.5 bg-white/4 border border-emerald-500/20 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAnalyzeRoute}
        disabled={isAnalyzingRoute}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg text-sm transition-colors duration-200 mt-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-cyan-500"
      >
        <IconRoute className="w-4 h-4" />
        {isAnalyzingRoute ? "Analizando..." : "Analizar ruta"}
      </button>

      {routeError && (
        <p className="text-[11px] font-mono text-red-400 leading-relaxed px-1">
          {routeError}
        </p>
      )}

      <p className="text-[10px] font-mono text-slate-600 text-center leading-relaxed">
        {routeMode === "demo"
          ? "Modo demo · las direcciones modifican el resumen, pero la geometría aún es simulada."
          : "Modo real · la geometría viene de OpenRouteService. El riesgo aún es experimental."}
      </p>
    </div>
  );
}
