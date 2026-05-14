import type { RouteAnalysis, RouteRiskLevel } from "@/components/map/routes/route-types";
import { formatDistanceKm } from "@/components/map/routes/route-utils";

const MAX_DISPLAY = 8;

const LEVEL_DOT: Record<RouteRiskLevel, string> = {
  low:    "bg-emerald-400",
  medium: "bg-amber-400",
  high:   "bg-red-500",
};

const LEVEL_TEXT: Record<RouteRiskLevel, string> = {
  low:    "text-emerald-400",
  medium: "text-amber-400",
  high:   "text-red-400",
};

function ScoreCell({ score, level }: { score: number; level: RouteRiskLevel }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[level]}`} />
      <span className={`text-[10px] font-mono ${LEVEL_TEXT[level]}`}>{score}</span>
    </div>
  );
}

export default function RouteSegmentsPanel({ route }: { route: RouteAnalysis | null }) {
  if (!route || route.segments.length === 0) return null;

  const { segments } = route;
  const displayed = segments.slice(0, MAX_DISPLAY);
  const hasMore = segments.length > MAX_DISPLAY;

  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Evolución por segmentos
        </p>
        {hasMore && (
          <span className="text-[10px] font-mono text-slate-600">
            {MAX_DISPLAY} / {segments.length}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_3rem_2.25rem_auto_auto] gap-x-2 px-2 mb-1.5">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">#</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">dist</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">com</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">local</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">acum.</span>
      </div>

      <div className="space-y-1">
        {displayed.map((seg, i) => (
          <div
            key={seg.id}
            className="grid grid-cols-[1.5rem_3rem_2.25rem_auto_auto] gap-x-2 items-center px-2 py-1.5 rounded-lg bg-white/3 border border-white/6"
          >
            <span className="text-[10px] font-mono text-slate-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {formatDistanceKm(seg.distanceMeters)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {seg.communeId !== null ? `C${seg.communeId}` : "–"}
            </span>
            <ScoreCell score={seg.localRiskScore} level={seg.localRiskLevel} />
            <ScoreCell score={seg.accumulatedRiskScore} level={seg.accumulatedRiskLevel} />
          </div>
        ))}
      </div>

      {hasMore && (
        <p className="text-[10px] font-mono text-slate-600 text-center mt-2">
          Mostrando {MAX_DISPLAY} de {segments.length} segmentos
        </p>
      )}
    </div>
  );
}
