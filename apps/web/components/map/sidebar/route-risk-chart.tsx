import type { RouteAnalysis, RouteRiskLevel } from "@/components/map/routes/route-types";
import { formatDistanceKm } from "@/components/map/routes/route-utils";

const W = 280;
const H = 120;
const PAD_T = 14;
const PAD_R = 14;
const PAD_B = 14;
const PAD_L = 14;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const LEVEL_COLOR: Record<RouteRiskLevel, string> = {
  low:    "#34d399",
  medium: "#fbbf24",
  high:   "#f87171",
};

interface ChartPt {
  x: number;
  y: number;
  level: RouteRiskLevel;
}

function sx(dist: number, total: number): number {
  return PAD_L + (total > 0 ? (dist / total) * PLOT_W : 0);
}

function sy(score: number): number {
  return PAD_T + (1 - Math.min(100, Math.max(0, score)) / 100) * PLOT_H;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export default function RouteRiskChart({ route }: { route: RouteAnalysis | null }) {
  if (!route || route.segments.length === 0 || route.totalDistanceMeters === 0) return null;

  const { segments, totalDistanceMeters, finalRiskScore } = route;

  // Anchor at x=0 using first segment's localRiskScore — the Euler initial condition R₀
  const r0 = segments[0].localRiskScore;
  const pts: ChartPt[] = [
    { x: sx(0, totalDistanceMeters), y: sy(r0), level: segments[0].localRiskLevel },
  ];

  let cumDist = 0;
  for (const seg of segments) {
    cumDist += seg.distanceMeters;
    pts.push({
      x: sx(cumDist, totalDistanceMeters),
      y: sy(seg.accumulatedRiskScore),
      level: seg.accumulatedRiskLevel,
    });
  }

  const polylineStr = pts.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(" ");

  const bottomY = PAD_T + PLOT_H;
  const areaD = [
    `M ${fmt(pts[0].x)},${bottomY}`,
    ...pts.map((p) => `L ${fmt(p.x)},${fmt(p.y)}`),
    `L ${fmt(pts[pts.length - 1].x)},${bottomY} Z`,
  ].join(" ");

  const y40 = sy(40);
  const y70 = sy(70);
  const xL = PAD_L;
  const xR = PAD_L + PLOT_W;

  const maxAccum = Math.max(...segments.map((s) => s.accumulatedRiskScore));

  const metrics: [string, string][] = [
    ["inicio", fmt(r0)],
    ["final",  fmt(finalRiskScore)],
    ["máx.",   fmt(maxAccum)],
    ["dist.",  formatDistanceKm(totalDistanceMeters)],
  ];

  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Curva Euler · Riesgo acumulado
        </p>
        <span className="text-[10px] font-mono text-slate-600">
          {formatDistanceKm(totalDistanceMeters)}
        </span>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/6 overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          aria-label="Curva de riesgo acumulado Euler"
        >
          <defs>
            <linearGradient id="euler-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Threshold lines */}
          <line
            x1={xL} y1={y70} x2={xR} y2={y70}
            stroke="#ef4444" strokeOpacity="0.18" strokeWidth="0.75" strokeDasharray="3 3"
          />
          <text
            x={xR - 2} y={y70 - 2}
            fill="#ef4444" fillOpacity="0.45"
            fontSize="6" textAnchor="end" fontFamily="monospace"
          >
            70
          </text>

          <line
            x1={xL} y1={y40} x2={xR} y2={y40}
            stroke="#f59e0b" strokeOpacity="0.18" strokeWidth="0.75" strokeDasharray="3 3"
          />
          <text
            x={xR - 2} y={y40 - 2}
            fill="#f59e0b" fillOpacity="0.45"
            fontSize="6" textAnchor="end" fontFamily="monospace"
          >
            40
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#euler-area-fill)" />

          {/* Accumulated risk line */}
          <polyline
            points={polylineStr}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Per-segment dots — skipped when many segments to keep chart readable */}
          {segments.length <= 20 &&
            pts.slice(1).map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2"
                fill={LEVEL_COLOR[p.level]}
                fillOpacity="0.9"
              />
            ))}
        </svg>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-1 mt-3">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col items-center p-2 rounded-lg bg-white/3 border border-white/6"
          >
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">
              {label}
            </span>
            <span className="text-[11px] font-mono text-slate-300 mt-0.5">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
