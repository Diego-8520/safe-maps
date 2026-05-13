import type { EnrichedFeatureProperties } from "@/components/map/types";
import {
  getDominantRiskFactor,
  getCommuneRiskInterpretation,
  getCommuneAcademicNote,
  getRiskBalance,
} from "@/components/map/analysis/commune-analysis";

function InterpretationBlock({ commune }: { commune: EnrichedFeatureProperties }) {
  const { title, description } = getCommuneRiskInterpretation(commune);
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
        Interpretación urbana
      </p>
      <p className="text-xs font-semibold text-slate-200 mb-1">{title}</p>
      <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function DominantFactorBlock({ commune }: { commune: EnrichedFeatureProperties }) {
  const { label, value, description } = getDominantRiskFactor(commune);
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
        Factor dominante
      </p>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-200">{label}</span>
        <span className="text-xs font-mono text-red-400">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-2">
        <div
          className="h-1 rounded-full bg-red-500/50 transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function BalanceBlock({ commune }: { commune: EnrichedFeatureProperties }) {
  const { positiveFactors, negativeFactors } = getRiskBalance(commune);
  if (positiveFactors.length === 0 && negativeFactors.length === 0) return null;

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
        Balance urbano
      </p>
      {positiveFactors.length > 0 && (
        <div className="mb-2.5">
          <p className="text-[10px] text-emerald-500 mb-1.5">Factores favorables</p>
          <div className="flex flex-wrap gap-1.5">
            {positiveFactors.map((f) => (
              <span
                key={f}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
      {negativeFactors.length > 0 && (
        <div>
          <p className="text-[10px] text-red-500 mb-1.5">Factores de riesgo</p>
          <div className="flex flex-wrap gap-1.5">
            {negativeFactors.map((f) => (
              <span
                key={f}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AcademicNoteBlock({ commune }: { commune: EnrichedFeatureProperties }) {
  const note = getCommuneAcademicNote(commune);
  return (
    <div className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/10">
      <p className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest mb-1.5">
        Nota académica
      </p>
      <p className="text-[10px] text-slate-500 leading-relaxed font-mono">{note}</p>
    </div>
  );
}

export default function CommuneAnalysisPanel({ commune }: { commune: EnrichedFeatureProperties }) {
  return (
    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
      <InterpretationBlock commune={commune} />
      <DominantFactorBlock commune={commune} />
      <BalanceBlock commune={commune} />
      <AcademicNoteBlock commune={commune} />
    </div>
  );
}
