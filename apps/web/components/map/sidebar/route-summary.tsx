import { IconShield } from "@/components/map/ui/map-icons";
import type { RouteAnalysis, RouteRiskLevel } from "@/components/map/routes/route-types";
import { formatDistanceKm } from "@/components/map/routes/route-utils";

const RISK_BADGE_STYLES: Record<RouteRiskLevel, { dot: string; text: string; bg: string; label: string }> = {
  low:    { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/25", label: "Bajo" },
  medium: { dot: "bg-amber-400",   text: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/25",     label: "Medio" },
  high:   { dot: "bg-red-500",     text: "text-red-300",     bg: "bg-red-500/10 border-red-500/25",         label: "Alto" },
};

function RiskBadge({ level }: { level: RouteRiskLevel }) {
  const s = RISK_BADGE_STYLES[level];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-xs font-mono ${s.text}`}>{s.label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <IconShield className="w-4 h-4 text-slate-600" />
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          Sin ruta analizada
        </p>
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed">
        Presiona <span className="text-slate-500 font-mono">Analizar ruta</span> para visualizar
        una ruta demo con riesgo acumulado.
      </p>
    </div>
  );
}

export default function RouteSummary({ route }: { route: RouteAnalysis | null }) {
  if (!route) return <EmptyState />;

  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <IconShield className="w-4 h-4 text-slate-400" />
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Contrato visual de ruta
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <span className="text-xs text-slate-400">Riesgo acumulado final</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">{route.finalRiskScore}/100</span>
            <RiskBadge level={route.finalRiskLevel} />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <span className="text-xs text-slate-400">Distancia</span>
          <span className="text-xs font-mono text-slate-200">{formatDistanceKm(route.totalDistanceMeters)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <span className="text-xs text-slate-400">Tiempo estimado</span>
          <span className="text-xs font-mono text-slate-200">{route.estimatedDurationMinutes} min</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <span className="text-xs text-slate-400">Origen</span>
          <span className="text-xs font-mono text-slate-300 truncate max-w-35 text-right">{route.originLabel}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <span className="text-xs text-slate-400">Destino</span>
          <span className="text-xs font-mono text-slate-300 truncate max-w-35 text-right">{route.destinationLabel}</span>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white/2 border border-white/5">
        <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
          Los colores representan riesgo acumulado, no tráfico.
        </p>
      </div>

      {route.mode === "demo" ? (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">
            Modo demostración
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ruta simulada para probar visualización. La geometría real será calculada por OpenRouteService en una fase posterior.
          </p>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
            Modo real
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Geometría real por calles via OpenRouteService. Los valores de riesgo son experimentales.
          </p>
        </div>
      )}
    </div>
  );
}
