type PipelineChipProps = {
  label: string;
  colorClass: string;
};

function PipelineChip({ label, colorClass }: PipelineChipProps) {
  return (
    <span className={`rounded-md border px-2 py-1 ${colorClass}`}>{label}</span>
  );
}

export function MethodologyHeader() {
  return (
    <div className="flex flex-col justify-center gap-7">
      <div>
        <p className="mb-3 text-[11px] font-mono uppercase tracking-widest text-cyan-400">
          Metodología
        </p>
        <h2 className="mb-5 text-3xl font-bold leading-tight text-white md:text-4xl">
          Cómo funciona el modelo de riesgo
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-slate-400">
          Safe Maps toma una ruta urbana real, la divide en segmentos y asigna a
          cada tramo un riesgo local según la comuna por la que pasa. Luego
          calcula cómo evoluciona el riesgo acumulado usando una ecuación
          diferencial aproximada con el método de Euler. El resultado no predice
          delitos: representa una exposición relativa al riesgo urbano durante el
          recorrido.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Exposición relativa · No predicción criminal
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Sin IA · Sin ML
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Euler numérico · Modelo analítico
        </span>
      </div>

      <div>
        <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
          Flujo del modelo
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <PipelineChip
            label="Ruta real"
            colorClass="text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
          />
          <span className="text-slate-600">→</span>
          <PipelineChip
            label="Segmentos"
            colorClass="text-slate-300 border-slate-600/50 bg-slate-800/30"
          />
          <span className="text-slate-600">→</span>
          <PipelineChip
            label="Riesgo local L"
            colorClass="text-amber-300 border-amber-500/30 bg-amber-500/10"
          />
          <span className="text-slate-600">→</span>
          <PipelineChip
            label="Euler"
            colorClass="text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
          />
          <span className="text-slate-600">→</span>
          <PipelineChip
            label="Riesgo acum. R"
            colorClass="text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
          />
        </div>
      </div>
    </div>
  );
}
