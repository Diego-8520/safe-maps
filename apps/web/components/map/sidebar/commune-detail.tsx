import { IconMapPin } from "@/components/map/ui/map-icons";
import type { EnrichedFeatureProperties } from "@/components/map/types";
import { getRiskColor, getRiskLevelLabel } from "@/components/map/risk-utils";
import StatRow from "./stat-row";
import CommuneAnalysisPanel from "./commune-analysis-panel";

export default function CommuneDetail({ selected }: { selected: EnrichedFeatureProperties | null }) {
  const color = selected ? getRiskColor(selected.riskLevel) : "#64748b";
  const label = selected ? getRiskLevelLabel(selected.riskLevel) : "";

  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 mb-4">
        <IconMapPin className="w-4 h-4 text-slate-400" />
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Comuna seleccionada
        </p>
      </div>

      {!selected ? (
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Selecciona una comuna en el mapa para ver el detalle de riesgo urbano.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate">{selected.nombre}</span>
            <div
              className="flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full border"
              style={{ background: `${color}18`, borderColor: `${color}40` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-xs font-mono" style={{ color }}>{label}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Puntaje de riesgo
            </p>
            <p className="text-2xl font-bold" style={{ color }}>
              {selected.riskScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </p>
          </div>

          <div className="space-y-3">
            <StatRow label="Criminalidad"   value={selected.criminalidad} />
            <StatRow label="Seguridad"      value={selected.seguridad} />
            <StatRow label="Vigilancia"     value={selected.vigilancia} />
            <StatRow label="Iluminación"    value={selected.iluminacion} />
            <StatRow label="Flujo personas" value={selected.flujoPersonas} />
          </div>

          <CommuneAnalysisPanel commune={selected} />

          <p className="text-[10px] font-mono text-slate-600">
            Datos simulados · Desarrollo académico
          </p>
        </div>
      )}
    </div>
  );
}
