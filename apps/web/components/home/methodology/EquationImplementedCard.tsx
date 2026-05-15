function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

export function EquationImplementedCard() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-linear-to-br from-amber-500/6 to-transparent p-6 backdrop-blur-sm">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-amber-300">
        Ecuación implementada
      </p>

      {/* ── Formula ────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/4 px-4 py-8">
        <div className="flex items-center gap-5 text-white">
          <div className="flex flex-col items-center font-serif text-3xl md:text-5xl">
            <span className="border-b border-white/30 px-3 pb-1">dR</span>
            <span className="pt-1 text-2xl md:text-3xl">dx</span>
          </div>
          <span className="font-serif text-3xl md:text-5xl">=</span>
          <span className="font-serif text-3xl md:text-5xl">k(L − R)</span>
        </div>
      </div>

      {/* ── Qué describe ─────────────────────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-slate-700/40 bg-slate-950/50 p-4">
        <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Qué describe esta ecuación
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          Esta ecuación describe cómo evoluciona la exposición al riesgo urbano mientras
          una persona avanza por la ruta. No mide delitos ni los predice: modela cuánto
          riesgo se ha acumulado en función del camino recorrido.
        </p>
      </div>

      {/* ── Variables ────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Significado de cada símbolo
        </p>

        {/* dR/dx — featured card, it is the most abstract term */}
        <div className="mb-2 rounded-xl border border-amber-500/20 bg-amber-500/4 p-4">
          <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-lg text-amber-300">dR / dx</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
              tasa de cambio del riesgo
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            No es el riesgo en sí mismo: es{" "}
            <strong className="text-slate-300">qué tan rápido está cambiando</strong> el
            riesgo mientras se avanza. Si es positivo, el riesgo sube. Si es negativo,
            baja. Si es cero, el riesgo se mantiene estable.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              sym: "R",
              label: "riesgo acumulado",
              desc: "El total de exposición que la ruta ha integrado hasta ese punto. Cambia suavemente con cada segmento.",
              color: "text-cyan-300",
            },
            {
              sym: "L",
              label: "riesgo local",
              desc: "El risk_score de la comuna actual, proveniente de Supabase. Representa el 'ambiente' de la zona.",
              color: "text-emerald-300",
            },
            {
              sym: "k",
              label: "constante de respuesta",
              desc: "Controla qué tan rápido R se acerca a L. Con k = 1, la reacción es directa y completa.",
              color: "text-amber-300",
            },
            {
              sym: "x",
              label: "distancia recorrida",
              desc: "La posición a lo largo de la ruta en kilómetros. Cada segmento aporta un Δx al avance total.",
              color: "text-slate-300",
            },
          ].map(({ sym, label, desc, color }) => (
            <div
              key={sym}
              className="rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-3"
            >
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className={`font-serif text-lg ${color}`}>{sym}</span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-slate-600">
                  {label}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tasa de cambio ───────────────────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/3 p-4">
        <p className="mb-2.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Qué significa "tasa de cambio"
        </p>
        <p className="mb-3 text-xs leading-relaxed text-slate-300">
          La derivada{" "}
          <span className="font-mono text-amber-300">dR/dx</span> no es el riesgo: es
          cuánto cambia el riesgo por cada kilómetro recorrido. Cuando es grande, el
          riesgo sube o baja rápido. Cuando es pequeña, el cambio es lento.
        </p>
        <p className="text-xs leading-relaxed text-slate-400">
          Es parecido a la velocidad de un vehículo: la velocidad no es la posición,
          sino cuánto cambia la posición por unidad de tiempo. De la misma forma,{" "}
          <span className="font-mono text-amber-300">dR/dx</span> describe el ritmo de
          cambio del riesgo, no su valor absoluto.
        </p>
      </div>

      {/* ── Behavior cards ───────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Comportamiento según la zona actual
        </p>
        <div className="space-y-2">
          {[
            {
              cond: "L > R",
              arrow: "↑",
              title: "Zona más riesgosa que lo acumulado",
              detail:
                "El riesgo acumulado comienza a subir gradualmente. Cuanto mayor sea la diferencia (L − R), más rápido sube.",
              borderCls: "border-rose-500/25",
              bgCls:     "bg-rose-500/6",
              condCls:   "text-rose-300 border-rose-500/30 bg-rose-500/10",
              arrowCls:  "text-rose-400",
            },
            {
              cond: "L < R",
              arrow: "↓",
              title: "Zona más tranquila que lo acumulado",
              detail:
                "El riesgo acumulado empieza a bajar progresivamente. El modelo reconoce un ambiente menos riesgoso.",
              borderCls: "border-emerald-500/25",
              bgCls:     "bg-emerald-500/6",
              condCls:   "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
              arrowCls:  "text-emerald-400",
            },
            {
              cond: "L = R",
              arrow: "→",
              title: "Zona y acumulado en equilibrio",
              detail:
                "La diferencia (L − R) es cero, entonces dR/dx = 0. No hay cambio: el riesgo permanece estable.",
              borderCls: "border-slate-600/30",
              bgCls:     "bg-slate-800/20",
              condCls:   "text-slate-400 border-slate-600/40 bg-slate-700/20",
              arrowCls:  "text-slate-400",
            },
          ].map(({ cond, arrow, title, detail, borderCls, bgCls, condCls, arrowCls }) => (
            <div key={cond} className={`rounded-xl border p-4 ${borderCls} ${bgCls}`}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${condCls}`}
                >
                  {cond}
                </span>
                <span className={`text-sm font-medium ${arrowCls}`}>{arrow}</span>
                <span className="text-xs font-medium text-white">{title}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Por qué no hay saltos bruscos ───────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/4 p-4">
        <p className="mb-2.5 text-[9px] font-mono uppercase tracking-widest text-amber-400/70">
          Por qué no hay saltos bruscos
        </p>
        <p className="mb-3 text-xs leading-relaxed text-slate-300">
          Al cruzar la frontera entre dos comunas, el riesgo acumulado no salta
          instantáneamente al valor de la nueva zona. El cambio depende de tres
          factores:
        </p>
        <ul className="space-y-2 text-xs leading-relaxed text-slate-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 font-mono text-[9px] text-amber-400/60">
              01
            </span>
            La{" "}
            <strong className="text-slate-300">diferencia (L − R)</strong>: si la
            brecha es pequeña, el cambio también lo es.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 font-mono text-[9px] text-amber-400/60">
              02
            </span>
            La{" "}
            <strong className="text-slate-300">longitud del segmento (Δx)</strong>:
            tramos cortos producen cambios menores.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 font-mono text-[9px] text-amber-400/60">
              03
            </span>
            El{" "}
            <strong className="text-slate-300">método de Euler</strong>: actualiza el
            acumulado en pasos discretos y finitos, nunca de forma abrupta.
          </li>
        </ul>
      </div>

      {/* ── Analogía ─────────────────────────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-slate-700/30 bg-slate-900/40 p-4">
        <p className="mb-2.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Analogía
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          Imagina que{" "}
          <span className="font-mono text-cyan-300">R</span> es la temperatura que
          trae tu cuerpo y{" "}
          <span className="font-mono text-emerald-300">L</span> es la temperatura del
          lugar al que entras. Si entras a un sitio más caliente, tu temperatura no
          cambia de golpe: empieza a subir gradualmente. Si sales a un lugar más frío,
          baja poco a poco. La ecuación hace exactamente eso con el riesgo: el
          acumulado siempre se mueve hacia el nivel local, sin saltos bruscos.
        </p>
      </div>

      {/* ── Code block ───────────────────────────────────────────────────── */}
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
            <span className="font-mono text-cyan-300">current</span> es el riesgo
            acumulado que la ruta llevaba antes de entrar al segmento.
          </p>
          <p>
            <span className="font-mono text-emerald-300">derivative</span> calcula qué
            tan fuerte debe cambiar el riesgo acumulado.
          </p>
          <p>
            <span className="font-mono text-amber-300">deltaKm</span> es la longitud
            del segmento en kilómetros. Mientras más largo sea el tramo, mayor efecto
            tendrá sobre el acumulado.
          </p>
          <p>
            <span className="font-mono text-cyan-300">clamp(..., 0, 100)</span> limita
            el resultado para que el sistema nunca salga de la escala de riesgo entre 0
            y 100.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ReferenceBadge>apps/web/lib/risk/euler-risk-integrator.ts</ReferenceBadge>
        <ReferenceBadge>líneas 66-69</ReferenceBadge>
      </div>
    </div>
  );
}
