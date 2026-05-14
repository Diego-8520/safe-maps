const TERMS: { symbol: string; name: string }[] = [
  { symbol: "R", name: "Riesgo acumulado actual" },
  { symbol: "L", name: "Riesgo local del segmento" },
  { symbol: "k", name: "Sensibilidad del ajuste" },
  { symbol: "dx", name: "Distancia del segmento" },
];

function TermRow({ symbol, name }: { symbol: string; name: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-5 text-center text-[10px] font-mono text-cyan-400 shrink-0">
        {symbol}
      </span>
      <span className="text-[10px] font-mono text-slate-400 flex-1">{name}</span>
    </div>
  );
}

export default function EulerModelPanel() {
  return (
    <div className="px-5 py-5 border-b border-white/5">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
        Modelo Euler
      </p>

      <div className="rounded-xl bg-white/3 border border-white/6 px-4 py-3 mb-3">
        <p className="text-[11px] font-mono text-cyan-300 tracking-wide text-center">
          R<sub>n+1</sub> = R<sub>n</sub> + k(L - R<sub>n</sub>)dx
        </p>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
        El acumulado evoluciona hacia el riesgo local del tramo actual. Zonas de
        mayor riesgo elevan la curva y zonas de menor riesgo la reducen gradualmente.
      </p>

      <div className="rounded-xl bg-white/3 border border-white/6 px-3 py-1 divide-y divide-white/4">
        {TERMS.map((term) => (
          <TermRow key={term.symbol} {...term} />
        ))}
      </div>
    </div>
  );
}
