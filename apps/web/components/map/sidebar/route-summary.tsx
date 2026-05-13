import { IconShield } from "@/components/map/ui/map-icons";

function RiskBadge({ level }: { level: "bajo" | "medio" | "alto" }) {
  const styles = {
    bajo:  { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/25", label: "Bajo" },
    medio: { dot: "bg-amber-400",   text: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/25",     label: "Medio" },
    alto:  { dot: "bg-red-500",     text: "text-red-300",     bg: "bg-red-500/10 border-red-500/25",         label: "Alto" },
  };
  const s = styles[level];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-xs font-mono ${s.text}`}>{s.label}</span>
    </div>
  );
}

export default function RouteSummary() {
  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <IconShield className="w-4 h-4 text-slate-400" />
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Resumen de ruta
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-xs text-slate-400">Riesgo estimado</span>
          <RiskBadge level="medio" />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-xs text-slate-400">Distancia</span>
          <span className="text-xs font-mono text-slate-200">4.2 km</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-xs text-slate-400">Tiempo estimado</span>
          <span className="text-xs font-mono text-slate-200">12 min</span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">
          Simulado
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Ruta simulada. Integración con modelo diferencial próximamente.
        </p>
      </div>
    </div>
  );
}
