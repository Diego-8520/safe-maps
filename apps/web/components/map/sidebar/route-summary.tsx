import { IconShield } from "@/components/map/ui/map-icons";
import type { RouteAnalysis, RouteRiskLevel } from "@/components/map/routes/route-types";
import { formatDistanceKm } from "@/components/map/routes/route-utils";

// Reference value for delta display — mid-range neutral start.
const INITIAL_RISK = 50;

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

function DeltaChip({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="text-xs font-mono text-red-400">
        ↑ +{delta} vs inicial {INITIAL_RISK}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="text-xs font-mono text-emerald-400">
        ↓ {delta} vs inicial {INITIAL_RISK}
      </span>
    );
  }
  return (
    <span className="text-xs font-mono text-slate-400">
      = sin cambio vs inicial {INITIAL_RISK}
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
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
        una ruta con riesgo acumulado.
      </p>
    </div>
  );
}

export default function RouteSummary({ route }: { route: RouteAnalysis | null }) {
  if (!route) return <EmptyState />;

  const segments = route.segments;
  const hasSegments = segments.length > 0;

  const maxLocalSegment = hasSegments
    ? segments.reduce((max, s) => (s.localRiskScore > max.localRiskScore ? s : max), segments[0])
    : null;

  const delta = route.finalRiskScore - INITIAL_RISK;

  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <IconShield className="w-4 h-4 text-slate-400" />
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Análisis de riesgo
        </p>
      </div>

      <div className="space-y-2">
        {/* ─── Risk analysis ─── */}
        <InfoRow label="Riesgo acumulado final">
          <span className="text-xs font-mono text-slate-500">{route.finalRiskScore}/100</span>
          <RiskBadge level={route.finalRiskLevel} />
        </InfoRow>

        <InfoRow label="Cambio acumulado">
          <DeltaChip delta={delta} />
        </InfoRow>

        {maxLocalSegment && (
          <InfoRow label="Riesgo local máximo">
            <span className="text-xs font-mono text-slate-500">{maxLocalSegment.localRiskScore}/100</span>
            <RiskBadge level={maxLocalSegment.localRiskLevel} />
          </InfoRow>
        )}

        {/* ─── Route details ─── */}
        <div className="pt-1">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2 px-1">
            Detalles del recorrido
          </p>
          <div className="space-y-2">
            {hasSegments && (
              <InfoRow label="Segmentos">
                <span className="text-xs font-mono text-slate-200">{segments.length}</span>
              </InfoRow>
            )}
            <InfoRow label="Distancia">
              <span className="text-xs font-mono text-slate-200">{formatDistanceKm(route.totalDistanceMeters)}</span>
            </InfoRow>
            <InfoRow label="Tiempo estimado">
              <span className="text-xs font-mono text-slate-200">{route.estimatedDurationMinutes} min</span>
            </InfoRow>
            <InfoRow label="Origen">
              <span className="text-xs font-mono text-slate-300 truncate max-w-35 text-right">{route.originLabel}</span>
            </InfoRow>
            <InfoRow label="Destino">
              <span className="text-xs font-mono text-slate-300 truncate max-w-35 text-right">{route.destinationLabel}</span>
            </InfoRow>
          </div>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white/2 border border-white/5">
        <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
          El riesgo acumulado evoluciona gradualmente. Un tramo de riesgo local alto no implica un salto inmediato en el acumulado.
        </p>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
          OpenRouteService · Euler v1
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Geometría real por calles. Riesgo acumulado calculado con modelo diferencial Euler.
        </p>
      </div>
    </div>
  );
}
