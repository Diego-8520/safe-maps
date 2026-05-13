import type { Metadata } from "next";
import Link from "next/link";
import MapLibreView from "@/components/map/map-libre-view";

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

// --- City Map SVG ---

function CityMap() {
  return (
    <svg
      viewBox="0 0 1000 620"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Base */}
      <rect width="1000" height="620" fill="#06111f" />

      {/* Risk zones */}
      <polygon
        points="580,0 1000,0 1000,380 820,460 670,310 590,140"
        fill="rgba(16,185,129,0.07)"
        stroke="rgba(16,185,129,0.12)"
        strokeWidth="1"
      />
      <polygon
        points="280,130 580,80 700,310 490,410 240,360"
        fill="rgba(245,158,11,0.07)"
        stroke="rgba(245,158,11,0.12)"
        strokeWidth="1"
      />
      <polygon
        points="0,190 280,170 360,390 195,510 0,490"
        fill="rgba(239,68,68,0.09)"
        stroke="rgba(239,68,68,0.15)"
        strokeWidth="1"
      />

      {/* Street grid — horizontal */}
      {[60, 110, 160, 210, 260, 310, 360, 410, 460, 510, 560].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(148,163,184,0.055)" strokeWidth="1" />
      ))}

      {/* Street grid — vertical */}
      {[60, 130, 200, 270, 340, 410, 480, 550, 620, 690, 760, 830, 900, 970].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="620" stroke="rgba(148,163,184,0.055)" strokeWidth="1" />
      ))}

      {/* Major avenues */}
      <line x1="0" y1="310" x2="1000" y2="310" stroke="rgba(148,163,184,0.13)" strokeWidth="2" />
      <line x1="480" y1="0" x2="480" y2="620" stroke="rgba(148,163,184,0.13)" strokeWidth="2" />

      {/* Diagonal road */}
      <line x1="0" y1="180" x2="900" y2="580" stroke="rgba(148,163,184,0.09)" strokeWidth="1.5" />

      {/* River feature */}
      <path
        d="M 310 0 C 330 80 295 160 315 240 C 335 320 300 400 320 510 C 330 560 310 600 305 620"
        stroke="rgba(6,182,212,0.18)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Route path */}
      <path
        d="M 160 200 C 220 200 260 240 310 280 C 365 325 395 345 450 360 C 510 378 555 358 610 378 C 660 395 700 420 750 440 C 795 458 840 468 870 480"
        stroke="rgba(6,182,212,0.85)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10 5"
        strokeLinecap="round"
      />

      {/* Origin marker */}
      <circle cx="160" cy="200" r="7"  fill="rgba(6,182,212,0.95)" />
      <circle cx="160" cy="200" r="13" fill="none" stroke="rgba(6,182,212,0.35)" strokeWidth="2" />
      <circle cx="160" cy="200" r="20" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="1.5" />

      {/* Destination marker */}
      <circle cx="870" cy="480" r="7"  fill="rgba(16,185,129,0.95)" />
      <circle cx="870" cy="480" r="13" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="2" />
      <circle cx="870" cy="480" r="20" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="1.5" />

      {/* Block fills (give depth) */}
      {[
        [70, 70, 55, 35],   [135, 70, 55, 35],  [420, 70, 55, 35],
        [70, 170, 55, 35],  [200, 220, 55, 35],  [560, 120, 55, 35],
        [630, 170, 55, 35], [700, 70, 55, 35],   [770, 320, 55, 35],
        [840, 170, 55, 35], [560, 320, 55, 35],  [420, 420, 55, 35],
        [700, 420, 55, 35], [840, 420, 55, 35],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(6,15,30,0.6)" rx="1" />
      ))}
    </svg>
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
        <span>Zoom 13</span>
        <span>3.4516° N · 76.5320° O</span>
      </div>
    </div>
  );
}

function MapZones() {
  return (
    <>
      <div className="absolute top-[18%] right-[12%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-mono text-emerald-300">Riesgo bajo</span>
      </div>
      <div className="absolute top-[48%] left-[42%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono text-amber-300">Riesgo medio</span>
      </div>
      <div className="absolute top-[62%] left-[9%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/25 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-[11px] font-mono text-red-300">Riesgo alto</span>
      </div>
    </>
  );
}

function MapMarkerLabels() {
  return (
    <>
      <div className="absolute top-[28%] left-[12%] px-2 py-0.5 rounded bg-[#060d1a]/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 whitespace-nowrap backdrop-blur-sm">
        Centro, Cali
      </div>
      <div className="absolute bottom-[18%] right-[8%] px-2 py-0.5 rounded bg-[#060d1a]/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 whitespace-nowrap backdrop-blur-sm">
        Aguablanca, Cali
      </div>
    </>
  );
}

function MapControls() {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1">
      {["+", "−"].map((label) => (
        <button
          key={label}
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#060d1a]/90 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 text-sm font-mono transition-colors duration-200 backdrop-blur-sm"
          aria-label={label === "+" ? "Acercar" : "Alejar"}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CoordWatermark() {
  return (
    <p className="absolute bottom-4 left-4 text-[9px] font-mono text-slate-700 pointer-events-none">
      3.4516° N · 76.5320° O
    </p>
  );
}

function MapArea() {
  return (
    <main className="flex-1 relative min-h-[55vh] md:min-h-0 overflow-hidden">
      <MapLibreView />
      <MapToolbar />
      <MapZones />
      <MapMarkerLabels />
      <MapControls />
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
