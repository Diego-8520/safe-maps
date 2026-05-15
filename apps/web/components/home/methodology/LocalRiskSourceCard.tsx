function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

const FLOW = [
  {
    title: "1. Usuario selecciona una ruta",
    desc: "El usuario escribe un origen y un destino dentro de Cali.",
    badge: "Frontend",
  },
  {
    title: "2. OpenRouteService genera la ruta real",
    desc: "La API devuelve coordenadas reales de calles y avenidas.",
    badge: "OpenRouteService",
  },
  {
    title: "3. La ruta se divide en segmentos",
    desc: "El backend transforma la geometría en pequeños tramos de aproximadamente 400 metros.",
    badge: "Segmentación",
  },
  {
    title: "4. Cada segmento se cruza con comunas",
    desc: "El sistema analiza el punto inicial y final del tramo para determinar por qué comuna pasa.",
    badge: "Análisis espacial",
  },
  {
    title: "5. Supabase aporta el riesgo local",
    desc: "Cada comuna tiene un risk_score normalizado entre 0 y 100 construido desde variables urbanas.",
    badge: "Supabase",
  },
  {
    title: "6. El segmento recibe localRiskScore",
    desc: "El riesgo de la comuna se transforma en el riesgo local del segmento actual.",
    badge: "TypeScript",
  },
  {
    title: "7. Euler calcula el riesgo acumulado",
    desc: "El modelo diferencial usa el riesgo local L para actualizar el acumulado R paso a paso.",
    badge: "Euler",
  },
  {
    title: "8. La interfaz visualiza el resultado",
    desc: "El mapa colorea segmentos y muestra cómo cambia el riesgo durante el recorrido.",
    badge: "UI",
  },
] as const;

export function LocalRiskSourceCard() {
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/5 to-transparent p-6 backdrop-blur-sm">
      <p className="mb-5 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
        Flujo del modelo y origen del riesgo
      </p>

      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 border-l border-dashed border-emerald-500/20" />

        <div className="space-y-5">
          {FLOW.map((item, index) => (
            <div key={item.title} className="relative">
              <div className="absolute -left-6 top-2 h-3.5 w-3.5 rounded-full border border-emerald-400/40 bg-emerald-400/20" />

              <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-mono text-emerald-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mb-2 text-sm font-semibold text-white">
                  {item.title}
                </h3>

                <p className="text-xs leading-relaxed text-slate-400">
                  {item.desc}
                </p>

                {index === 4 && (
                  <div className="mt-4 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3 text-xs leading-relaxed text-slate-400">
                    Variables como criminalidad, seguridad, vigilancia,
                    iluminación y flujo de personas alimentan el risk_score en
                    la base de datos. En esta versión, Euler no usa directamente
                    esas variables; utiliza el puntaje final ya calculado.
                  </div>
                )}

                {index === 6 && (
                  <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/3 p-3 text-xs leading-relaxed text-slate-300">
                    Euler toma el riesgo acumulado anterior y lo compara con el
                    riesgo local del segmento actual. Luego calcula cuánto debe
                    subir o bajar el acumulado dependiendo de la distancia
                    recorrida.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ReferenceBadge>
          apps/web/lib/repositories/supabase-commune-risk-repository.ts
        </ReferenceBadge>
        <ReferenceBadge>
          apps/web/lib/routes/normalize-openroute-route.ts
        </ReferenceBadge>
      </div>
    </div>
  );
}
