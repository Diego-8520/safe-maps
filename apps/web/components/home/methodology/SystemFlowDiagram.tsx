type NodeColor = "cyan" | "emerald" | "amber" | "violet";

const NODES: Array<{
  label: string;
  sub: string;
  value: string;
  color: NodeColor;
}> = [
  {
    label: "Origen · Destino",
    sub: "coordenadas GPS del usuario",
    value: "[lng, lat]",
    color: "cyan",
  },
  {
    label: "OpenRouteService",
    sub: "geometría real de la vía",
    value: "GeoJSON LineString",
    color: "cyan",
  },
  {
    label: "Segmentación ~400 m",
    sub: "segmentByDistance()",
    value: "RouteSegment[]",
    color: "cyan",
  },
  {
    label: "Supabase · risk_score",
    sub: "commune_risk_profiles",
    value: "L ∈ [0, 100]",
    color: "emerald",
  },
  {
    label: "Euler  dR/dx = k(L − R)",
    sub: "calculateEulerRiskEvolution()",
    value: "R por segmento",
    color: "amber",
  },
  {
    label: "Mapa · Paneles UI",
    sub: "RouteAnalysis.segments",
    value: "colores + análisis",
    color: "violet",
  },
];

const DOT_RGB: Record<NodeColor, string> = {
  cyan:    "#22d3ee",
  emerald: "#34d399",
  amber:   "#fbbf24",
  violet:  "#a78bfa",
};

const NODE_STYLES: Record<
  NodeColor,
  { border: string; bg: string; text: string; dot: string; line: string }
> = {
  cyan: {
    border: "border-cyan-500/30",
    bg:     "bg-cyan-500/[0.06]",
    text:   "text-cyan-300",
    dot:    "bg-cyan-400",
    line:   "border-cyan-500/25",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg:     "bg-emerald-500/[0.06]",
    text:   "text-emerald-300",
    dot:    "bg-emerald-400",
    line:   "border-emerald-500/25",
  },
  amber: {
    border: "border-amber-500/30",
    bg:     "bg-amber-500/[0.06]",
    text:   "text-amber-300",
    dot:    "bg-amber-400",
    line:   "border-amber-500/25",
  },
  violet: {
    border: "border-violet-500/30",
    bg:     "bg-violet-500/[0.06]",
    text:   "text-violet-300",
    dot:    "bg-violet-400",
    line:   "border-violet-500/25",
  },
};

const DELAY_CLASSES = [
  "sfd-d0", "sfd-d1", "sfd-d2", "sfd-d3", "sfd-d4",
] as const;

export function SystemFlowDiagram() {
  return (
    <div className="relative rounded-2xl border border-slate-700/30 bg-linear-to-b from-slate-900/80 to-[#06101d] p-5">
      <style>{`
        @keyframes sfd-flow {
          0%   { top: 0%;   opacity: 0;   }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 100%; opacity: 0;   }
        }
        .sfd-dot { animation: sfd-flow 2.8s ease-in-out infinite; }
        .sfd-d0  { animation-delay: 0.0s; }
        .sfd-d1  { animation-delay: 0.5s; }
        .sfd-d2  { animation-delay: 1.0s; }
        .sfd-d3  { animation-delay: 1.5s; }
        .sfd-d4  { animation-delay: 2.0s; }
      `}</style>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Pipeline del sistema
        </p>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          sistema activo
        </span>
      </div>

      {NODES.map(({ label, sub, value, color }, i) => {
        const st = NODE_STYLES[color];
        const isLast = i === NODES.length - 1;
        const delayClass = DELAY_CLASSES[i] ?? "sfd-d0";

        return (
          <div key={label}>
            {/* Node */}
            <div
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300 hover:brightness-125 ${st.border} ${st.bg}`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full animate-pulse ${st.dot}`}
                style={{ animationDelay: `${i * 0.22}s` }}
              />
              <div className="min-w-0 flex-1">
                <p className={`font-mono text-[11px] font-semibold leading-tight ${st.text}`}>
                  {label}
                </p>
                <p className="mt-0.5 font-mono text-[9px] leading-none text-slate-500">
                  {sub}
                </p>
              </div>
              <span className="hidden shrink-0 rounded border border-slate-700/50 bg-slate-900/60 px-1.5 py-0.5 font-mono text-[9px] text-slate-600 sm:block">
                {value}
              </span>
            </div>

            {/* Connector with animated flow dot */}
            {!isLast && (
              <div className="relative flex h-5 items-stretch pl-4.5">
                <div className={`relative border-l border-dashed ${st.line} overflow-visible`}>
                  <div
                    className={`sfd-dot ${delayClass} absolute rounded-full`}
                    style={{
                      width: 4,
                      height: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: DOT_RGB[color],
                    }}
                  />
                </div>
                <span className="self-center pl-1.5 text-[10px] text-slate-700">↓</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom label */}
      <div className="mt-4 border-t border-slate-800/60 pt-3">
        <p className="text-[9px] font-mono leading-relaxed text-slate-700">
          6 etapas · datos reales · sin predicción de delitos
        </p>
      </div>
    </div>
  );
}
