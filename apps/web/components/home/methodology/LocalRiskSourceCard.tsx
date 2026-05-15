function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

type FlowNode = {
  label: string;
  sublabel?: string;
  variant: "db" | "type" | "euler";
};

const FLOW: FlowNode[] = [
  {
    label: "commune_risk_profiles.risk_score",
    sublabel: "Supabase",
    variant: "db",
  },
  {
    label: "CommuneRisk.riskScore",
    sublabel: "dominio TypeScript",
    variant: "type",
  },
  {
    label: "RouteSegment.localRiskScore",
    sublabel: "segmento enriquecido",
    variant: "type",
  },
  {
    label: "Euler  →  usa como L",
    sublabel: "integrador numérico",
    variant: "euler",
  },
];

const VARIANT_CLASS: Record<FlowNode["variant"], string> = {
  db: "border-slate-600/50 bg-slate-900/60 text-slate-300",
  type: "border-slate-700/40 bg-slate-900/40 text-slate-300",
  euler:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

export function LocalRiskSourceCard() {
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.05] to-transparent p-6 backdrop-blur-sm">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
        Fuente de riesgo local
      </p>

      <div className="mb-4">
        {FLOW.map(({ label, sublabel, variant }, i) => (
          <div key={label}>
            <div
              className={`rounded-lg border px-3 py-2.5 font-mono text-[10px] ${VARIANT_CLASS[variant]}`}
            >
              <span>{label}</span>
              {sublabel && (
                <span className="ml-2 text-slate-600">· {sublabel}</span>
              )}
            </div>
            {i < FLOW.length - 1 && (
              <div className="ml-5 flex h-5 items-center">
                <div className="h-full border-l border-dashed border-emerald-500/25" />
                <span className="-ml-[3px] text-[11px] text-emerald-500/50">
                  ↓
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        Supabase entrega perfiles de riesgo por comuna. Cada perfil tiene un{" "}
        <span className="font-mono text-emerald-300">risk_score</span>{" "}
        normalizado entre 0 y 100. Ese valor se convierte en{" "}
        <span className="font-mono text-slate-300">localRiskScore</span> dentro
        del segmento de ruta y Euler lo usa como{" "}
        <span className="font-mono text-amber-300">L</span>.
      </p>

      <div className="mb-4 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
        <p className="text-[10px] leading-relaxed text-slate-500">
          Variables como criminalidad, seguridad, vigilancia, iluminación y
          flujo de personas alimentan el{" "}
          <span className="font-mono text-slate-400">risk_score</span> en la
          base de datos. En esta versión, Euler no las usa directamente; opera
          sobre el puntaje final ya calculado.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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
