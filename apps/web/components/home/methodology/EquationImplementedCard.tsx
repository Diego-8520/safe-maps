function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

const VARIABLES = [
  { symbol: "R(x)", desc: "Riesgo acumulado durante el recorrido" },
  { symbol: "x", desc: "Distancia recorrida en kilómetros" },
  { symbol: "L", desc: "Riesgo local del segmento actual" },
  { symbol: "k = 1", desc: "Sensibilidad del ajuste (euler-v1)" },
] as const;

const BEHAVIOR = [
  {
    cond: "L > R",
    effect: "sube",
    colorClass:
      "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    cond: "L < R",
    effect: "baja",
    colorClass:
      "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    cond: "L = R",
    effect: "estable",
    colorClass:
      "text-slate-400 border-slate-600/40 bg-slate-700/20",
  },
] as const;

export function EquationImplementedCard() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-6 backdrop-blur-sm">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-amber-300">
        Ecuación implementada
      </p>

      <div className="mb-5 flex items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-5">
        <span className="font-mono text-2xl font-semibold tracking-wide text-white md:text-3xl">
          dR/dx = k(L − R)
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {VARIABLES.map(({ symbol, desc }) => (
          <div
            key={symbol}
            className="rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-2"
          >
            <p className="mb-0.5 font-mono text-[11px] font-semibold text-amber-300">
              {symbol}
            </p>
            <p className="text-[10px] leading-relaxed text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {BEHAVIOR.map(({ cond, effect, colorClass }) => (
          <span
            key={cond}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-mono ${colorClass}`}
          >
            {cond}&nbsp;→&nbsp;<strong>{effect}</strong>
          </span>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
        <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Código real · paso por segmento
        </p>
        <pre className="overflow-x-auto text-[10px] leading-relaxed text-slate-300">
          <code>{`const derivative = EULER_LOCAL_RISK_RESPONSE_K * (localRiskScore - current);
const next = clamp(current + derivative * deltaKm, 0, 100);`}</code>
        </pre>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          <span className="font-mono text-slate-400">deltaKm</span> es la
          longitud del tramo. El acumulado evoluciona con la distancia, no en
          saltos abruptos al cambiar de comuna.
        </p>
      </div>

      <ReferenceBadge>
        apps/web/lib/risk/euler-risk-integrator.ts
      </ReferenceBadge>
    </div>
  );
}
