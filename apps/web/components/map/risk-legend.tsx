const LEVELS = [
  { label: "Bajo",  dot: "#34d399", text: "#6ee7b7" },
  { label: "Medio", dot: "#fbbf24", text: "#fcd34d" },
  { label: "Alto",  dot: "#f87171", text: "#fca5a5" },
] as const;

export default function RiskLegend() {
  return (
    <div className="absolute bottom-10 left-4 z-10 bg-[#060d1a]/90 border border-white/8 rounded-xl px-3.5 py-3 backdrop-blur-sm pointer-events-none">
      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2.5">
        Nivel de riesgo
      </p>
      <div className="space-y-2">
        {LEVELS.map(({ label, dot, text }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: dot }}
            />
            <span className="text-[11px] font-mono" style={{ color: text }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
