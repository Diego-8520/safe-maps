function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

const VARIABLES = [
  {
    symbol: "R(x)",
    desc: "Riesgo acumulado que lleva la ruta hasta ese punto.",
  },
  {
    symbol: "L",
    desc: "Riesgo local del segmento actual o comuna actual.",
  },
  {
    symbol: "k",
    desc: "Velocidad con la que R se acerca al riesgo local L.",
  },
  {
    symbol: "dx",
    desc: "Pequeña distancia recorrida en el segmento.",
  },
] as const;

export function EquationImplementedCard() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-linear-to-br from-amber-500/6 to-transparent p-6 backdrop-blur-sm">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-amber-300">
        Ecuación implementada
      </p>

      <div className="mb-6 flex items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/4 px-4 py-8">
        <div className="flex items-center gap-5 text-white">
          <div className="flex flex-col items-center font-serif text-3xl md:text-5xl">
            <span className="border-b border-white/30 px-3 pb-1">dR</span>
            <span className="pt-1 text-2xl md:text-3xl">dx</span>
          </div>

          <span className="font-serif text-3xl md:text-5xl">=</span>

          <span className="font-serif text-3xl md:text-5xl">
            k(L − R)
          </span>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-slate-700/40 bg-slate-950/50 p-4">
        <p className="mb-3 text-sm leading-relaxed text-slate-300">
          La idea principal es sencilla: el riesgo acumulado de la ruta intenta
          acercarse gradualmente al riesgo local del lugar por donde avanza el
          usuario.
        </p>

        <div className="space-y-2 text-xs leading-relaxed text-slate-400">
          <p>
            • Si el segmento actual tiene un riesgo local más alto que el
            acumulado actual, entonces el valor sube.
          </p>
          <p>
            • Si el segmento tiene un riesgo local más bajo, el acumulado baja
            progresivamente.
          </p>
          <p>
            • Si ambos valores son iguales, el riesgo permanece estable.
          </p>
          <p>
            • El cambio no ocurre de golpe: Euler hace que la transición sea
            gradual dependiendo de la distancia recorrida.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {VARIABLES.map(({ symbol, desc }) => (
          <div
            key={symbol}
            className="rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-3"
          >
            <p className="mb-1 font-serif text-lg text-amber-300">{symbol}</p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Código real · paso por segmento
        </p>

        <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black/30 p-3 text-[11px] leading-relaxed text-slate-300">
          <code>{`const derivative = EULER_LOCAL_RISK_RESPONSE_K * (localRiskScore - current);
const next = clamp(current + derivative * deltaKm, 0, 100);`}</code>
        </pre>

        <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-400">
          <p>
            <span className="font-mono text-amber-300">localRiskScore</span>{" "}
            es el riesgo local del segmento actual.
          </p>

          <p>
            <span className="font-mono text-cyan-300">current</span> es el
            riesgo acumulado que la ruta llevaba antes de entrar al segmento.
          </p>

          <p>
            <span className="font-mono text-emerald-300">derivative</span>{" "}
            calcula qué tan fuerte debe cambiar el riesgo acumulado.
          </p>

          <p>
            <span className="font-mono text-amber-300">deltaKm</span> es la
            longitud del segmento en kilómetros. Mientras más largo sea el
            tramo, mayor efecto tendrá sobre el acumulado.
          </p>

          <p>
            <span className="font-mono text-cyan-300">clamp(..., 0, 100)</span>
            limita el resultado para que el sistema nunca salga de la escala de
            riesgo entre 0 y 100.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ReferenceBadge>
          apps/web/lib/risk/euler-risk-integrator.ts
        </ReferenceBadge>
        <ReferenceBadge>líneas 66-69</ReferenceBadge>
      </div>
    </div>
  );
}
