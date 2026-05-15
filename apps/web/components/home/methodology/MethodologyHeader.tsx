export function MethodologyHeader() {
  return (
    <div className="flex flex-col justify-center gap-6">
      <div>
        <p className="mb-3 text-[11px] font-mono uppercase tracking-widest text-cyan-400">
          Metodología
        </p>
        <h2 className="mb-5 text-3xl font-bold leading-tight text-white md:text-4xl">
          Cómo funciona el modelo
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 md:text-[15px]">
          Safe Maps toma una ruta urbana real proporcionada por OpenRouteService,
          la divide en segmentos y asigna a cada tramo un riesgo local según la
          comuna por la que pasa. Para cada segmento se revisa su punto inicial y
          su punto final, se analiza su posición dentro de la ruta y se usa esa
          información para construir una lectura progresiva del recorrido. Luego
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
          Ruta real · Segmentos · Comunas
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Euler numérico · Modelo académico
        </span>
      </div>
    </div>
  );
}
