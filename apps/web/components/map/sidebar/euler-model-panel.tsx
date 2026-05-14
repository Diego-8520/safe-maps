const VARIABLES: { symbol: string; name: string; effect: "increase" | "decrease" }[] = [
  { symbol: "C", name: "Criminalidad",      effect: "increase" },
  { symbol: "S", name: "Seguridad",         effect: "decrease" },
  { symbol: "V", name: "Vigilancia",        effect: "decrease" },
  { symbol: "I", name: "Iluminación",       effect: "decrease" },
  { symbol: "F", name: "Flujo de personas", effect: "increase" },
];

function VariableRow({
  symbol,
  name,
  effect,
}: {
  symbol: string;
  name: string;
  effect: "increase" | "decrease";
}) {
  const arrow = effect === "increase" ? "↑" : "↓";
  const arrowColor = effect === "increase" ? "text-red-400" : "text-emerald-400";

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-4 text-center text-[10px] font-mono text-cyan-400 shrink-0">
        {symbol}
      </span>
      <span className="text-[10px] font-mono text-slate-400 flex-1">{name}</span>
      <span className={`text-[10px] font-mono ${arrowColor}`}>{arrow}</span>
    </div>
  );
}

export default function EulerModelPanel() {
  return (
    <div className="px-5 py-5 border-b border-white/5">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
        Modelo diferencial
      </p>

      {/* Formula block */}
      <div className="rounded-xl bg-white/3 border border-white/6 px-4 py-3 mb-3">
        <p className="text-[11px] font-mono text-cyan-300 tracking-wide text-center">
          R<sub>n+1</sub> = R<sub>n</sub> + f(C, S, V, I, F) · Δx
        </p>
      </div>

      {/* Explanation */}
      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
        El riesgo acumulado no cambia de golpe: evoluciona segmento por segmento según la
        distancia recorrida y las variables urbanas de cada comuna.
      </p>

      {/* Variables */}
      <div className="rounded-xl bg-white/3 border border-white/6 px-3 py-1 divide-y divide-white/4">
        {VARIABLES.map((v) => (
          <VariableRow key={v.symbol} {...v} />
        ))}
        <div className="flex items-center gap-2 py-1">
          <span className="w-4 text-center text-[10px] font-mono text-slate-500 shrink-0">
            Δx
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex-1">
            Distancia del segmento
          </span>
        </div>
      </div>
    </div>
  );
}
