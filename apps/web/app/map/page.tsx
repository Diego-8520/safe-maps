import type { Metadata } from "next";
import Link from "next/link";
import MapLibreView from "@/components/map/map-libre-view";
import RiskLegend from "@/components/map/risk-legend";

export const metadata: Metadata = {
  title: "Mapa — Safe Maps",
  description: "Análisis de ruta urbana en Cali, Colombia.",
};

// --- Icons ---

type IconProps = { className?: string };

function IconArrowLeft({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function IconPin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconFlag({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconRoute({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// --- Sidebar ---

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
      <Link
        href="/"
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:border-cyan-500/40 hover:text-cyan-400 text-slate-400 transition-colors duration-200"
        aria-label="Volver al inicio"
      >
        <IconArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            Safe Maps
          </span>
        </div>
        <h1 className="text-sm font-semibold text-white leading-tight mt-0.5">
          Análisis de ruta
        </h1>
      </div>
    </div>
  );
}

function RouteInputs() {
  return (
    <div className="px-5 py-5 border-b border-white/5 space-y-3">
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Origen
        </label>
        <div className="relative">
          <IconPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            readOnly
            defaultValue="Centro, Cali"
            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-cyan-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-default"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <div className="flex flex-col gap-0.5">
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
        </div>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Destino
        </label>
        <div className="relative">
          <IconFlag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            readOnly
            defaultValue="Aguablanca, Cali"
            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-emerald-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-default"
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg text-sm transition-colors duration-200 mt-1"
      >
        <IconRoute className="w-4 h-4" />
        Analizar ruta
      </button>
    </div>
  );
}

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

function RouteResults() {
  return (
    <div className="px-5 py-5">
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

      <div className="mt-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">
          Nota
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Datos simulados. Integración con modelo diferencial y datos reales próximamente.
        </p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-full md:w-80 md:shrink-0 flex flex-col bg-[#060d1a] border-r border-white/5 md:h-full overflow-y-auto">
      <SidebarHeader />
      <RouteInputs />
      <RouteResults />
    </aside>
  );
}

// --- Map Area ---

function MapToolbar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#060d1a]/80 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
        <span className="text-cyan-400">●</span>
        <span>Cali · Valle del Cauca · Colombia</span>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-600">
        <span>Zoom 12</span>
        <span>3.4516° N · 76.5320° O</span>
      </div>
    </div>
  );
}

function CoordWatermark() {
  return (
    <p className="absolute bottom-4 left-4 text-[9px] font-mono text-slate-700 pointer-events-none z-10">
      3.4516° N · 76.5320° O
    </p>
  );
}

function MapArea() {
  return (
    <main className="flex-1 relative min-h-[55vh] md:min-h-0 overflow-hidden">
      <MapLibreView />
      <MapToolbar />
      <RiskLegend />
      <CoordWatermark />
    </main>
  );
}

// --- Page ---

export default function MapPage() {
  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
      <Sidebar />
      <MapArea />
    </div>
  );
}
