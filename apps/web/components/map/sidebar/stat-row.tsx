export default function StatRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] font-mono text-slate-200">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-1 rounded-full bg-cyan-500/50 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
