// --- Icon components (inline SVG) ---

type IconProps = { className?: string };

function IconMap({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20.5L3 17.5V3.5L9 6.5M9 20.5L15 17.5M9 20.5V6.5M15 17.5L21 20.5V6.5L15 3.5M15 17.5V3.5M9 6.5L15 3.5" />
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

function IconFunction({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 5C13 5 12 7 12 9v6c0 2-1 4-3.5 4" />
      <path d="M8.5 9h7M8.5 15h7" />
    </svg>
  );
}

function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// --- Navbar ---

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-cyan-500/10 bg-[#050a14]/85 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-white font-semibold text-sm tracking-[0.18em] uppercase">
          Safe Maps
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Características", href: "#features" },
          { label: "Mapa", href: "#map" },
          { label: "Metodología", href: "#flow" },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Online
      </div>
    </nav>
  );
}

// --- Hero ---

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden bg-[#050a14]">
      {/* Coordinate grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radar rings */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {[80, 160, 240, 320, 400].map((r) => (
          <circle key={r} cx="400" cy="400" r={r} fill="none" stroke="rgb(6,182,212)" strokeWidth="1" />
        ))}
        <line x1="400" y1="0" x2="400" y2="800" stroke="rgb(6,182,212)" strokeWidth="0.5" />
        <line x1="0" y1="400" x2="800" y2="400" stroke="rgb(6,182,212)" strokeWidth="0.5" />
      </svg>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Corner meta */}
      <p className="absolute top-24 left-6 text-[10px] font-mono text-cyan-500/25 leading-relaxed hidden md:block">
        3.4516° N<br />76.5320° O
      </p>
      <p className="absolute top-24 right-6 text-[10px] font-mono text-cyan-500/25 leading-relaxed text-right hidden md:block">
        CALI · COL<br />ZONA URBANA
      </p>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Sistema activo · Beta académica
        </div>

        <h1 className="title-glow text-7xl md:text-9xl font-bold text-white tracking-tight mb-6 leading-none">
          Safe<span className="text-cyan-400">Maps</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Análisis de riesgo urbano en Cali mediante mapas interactivos y
          ecuaciones diferenciales.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#map"
            className="group flex items-center gap-2.5 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg transition-all duration-200 text-sm uppercase tracking-wide"
          >
            Explorar mapa
            <IconArrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
          <a
            href="#flow"
            className="flex items-center gap-2.5 px-8 py-3.5 border border-slate-600 hover:border-cyan-500/50 hover:text-white text-slate-300 font-medium rounded-lg transition-all duration-200 text-sm uppercase tracking-wide"
          >
            Ver modelo matemático
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050a14] to-transparent pointer-events-none" />
    </section>
  );
}

// --- Features ---

type FeatureCardProps = {
  icon: (props: IconProps) => React.JSX.Element;
  title: string;
  description: string;
  accent: "cyan" | "emerald" | "amber";
};

const ACCENT: Record<string, { border: string; iconBg: string; icon: string }> = {
  cyan:    { border: "border-cyan-500/20 hover:border-cyan-500/40",    iconBg: "bg-cyan-500/10",    icon: "text-cyan-400"    },
  emerald: { border: "border-emerald-500/20 hover:border-emerald-500/40", iconBg: "bg-emerald-500/10", icon: "text-emerald-400" },
  amber:   { border: "border-amber-500/20 hover:border-amber-500/40",   iconBg: "bg-amber-500/10",   icon: "text-amber-400"   },
};

function FeatureCard({ icon: Icon, title, description, accent }: FeatureCardProps) {
  const a = ACCENT[accent];
  return (
    <div className={`p-6 rounded-2xl border ${a.border} bg-white/[0.02] backdrop-blur-sm transition-all duration-300`}>
      <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center mb-5`}>
        <Icon className={`w-5 h-5 ${a.icon}`} />
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-[#050a14]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-3">
            Plataforma
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Herramientas de análisis
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={IconMap}
            title="Mapa Interactivo"
            description="Visualización geoespacial de Cali con capas de riesgo organizadas por comunas y barrios."
            accent="cyan"
          />
          <FeatureCard
            icon={IconShield}
            title="Riesgo Urbano"
            description="Clasificación de zonas según indicadores históricos de peligro en tres niveles de severidad."
            accent="emerald"
          />
          <FeatureCard
            icon={IconFunction}
            title="Modelo Diferencial"
            description="Sistema de ecuaciones diferenciales que modela la evolución espaciotemporal del riesgo."
            accent="amber"
          />
        </div>
      </div>
    </section>
  );
}

// --- Map Preview ---

type RiskLevel = "low" | "medium" | "high";

type RiskDotProps = { x: number; y: number; level: RiskLevel };

const DOT_COLORS: Record<RiskLevel, string> = {
  low:    "bg-emerald-400",
  medium: "bg-amber-400",
  high:   "bg-red-500",
};
const RING_COLORS: Record<RiskLevel, string> = {
  low:    "bg-emerald-400/25",
  medium: "bg-amber-400/25",
  high:   "bg-red-500/25",
};

function RiskDot({ x, y, level }: RiskDotProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${RING_COLORS[level]} animate-ping`} />
      <div className={`relative w-2.5 h-2.5 rounded-full ${DOT_COLORS[level]} -translate-x-1/2 -translate-y-1/2`} />
    </div>
  );
}

function MapPreview() {
  return (
    <section id="map" className="py-28 px-6 bg-[#03070f]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-3">
            Visualización
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Interfaz del mapa
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Vista previa estática — integración MapLibre próximamente
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-cyan-500/15">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#060d1a] border-b border-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                safe-maps · Cali, Valle del Cauca
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span>Zoom: 13</span>
              <span>3.4516° N · 76.5320° O</span>
            </div>
          </div>

          {/* Map body */}
          <div className="relative h-[480px] bg-[#060d1a] overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

            {/* SVG zones */}
            <svg
              viewBox="0 0 800 480"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Low risk — emerald */}
              <polygon points="60,70 180,50 210,130 150,175 70,155"  fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" strokeWidth="1" />
              <polygon points="500,50 630,30 665,115 575,148 475,120" fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.30)" strokeWidth="1" />
              <polygon points="630,295 730,272 768,355 680,395 605,365" fill="rgba(16,185,129,0.09)" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />

              {/* Medium risk — amber */}
              <polygon points="180,50 325,38 358,135 255,178 210,130"  fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)" strokeWidth="1" />
              <polygon points="70,155 210,175 235,278 155,318 62,295"  fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.30)" strokeWidth="1" />
              <polygon points="395,195 520,175 558,278 455,318 375,285" fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.30)" strokeWidth="1" />
              <polygon points="318,335 438,318 478,418 375,438 295,418" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />

              {/* High risk — red */}
              <polygon points="255,178 378,155 418,258 335,298 235,278" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.42)" strokeWidth="1" />
              <polygon points="155,318 278,298 318,398 215,438 135,408" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)" strokeWidth="1" />
              <polygon points="520,175 645,155 682,258 578,298 498,268" fill="rgba(239,68,68,0.10)" stroke="rgba(239,68,68,0.30)" strokeWidth="1" />

              {/* Route */}
              <path
                d="M 125 112 C 198 148 278 195 318 228 C 355 258 398 278 458 248 C 518 218 568 195 625 318"
                stroke="rgba(6,182,212,0.75)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="7 4"
              />

              {/* Origin */}
              <circle cx="125" cy="112" r="6"  fill="rgba(6,182,212,0.95)" />
              <circle cx="125" cy="112" r="11" fill="none" stroke="rgba(6,182,212,0.35)" strokeWidth="2" />

              {/* Destination */}
              <circle cx="625" cy="318" r="6"  fill="rgba(16,185,129,0.95)" />
              <circle cx="625" cy="318" r="11" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="2" />
            </svg>

            {/* Risk dots */}
            <RiskDot x={20} y={22} level="low"    />
            <RiskDot x={73} y={13} level="low"    />
            <RiskDot x={28} y={50} level="medium" />
            <RiskDot x={49} y={60} level="high"   />
            <RiskDot x={34} y={74} level="high"   />
            <RiskDot x={63} y={52} level="medium" />
            <RiskDot x={80} y={67} level="low"    />

            {/* Scan line */}
            <div
              className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-cyan-400/6 to-transparent pointer-events-none"
              style={{ animation: "scanline 7s ease-in-out infinite" }}
            />

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-[#0a1628]/90 border border-cyan-500/15 rounded-xl p-3.5 text-[11px] font-mono backdrop-blur-sm">
              <p className="text-cyan-400 uppercase tracking-widest text-[9px] mb-2.5">
                Nivel de riesgo
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Bajo (0–33)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Medio (34–66)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-300">Alto (67–100)</span>
                </div>
              </div>
            </div>

            {/* Route info */}
            <div className="absolute bottom-4 left-4 bg-[#0a1628]/90 border border-slate-700/40 rounded-xl p-3.5 text-[11px] font-mono backdrop-blur-sm">
              <p className="text-slate-500 text-[9px] uppercase tracking-widest mb-2">
                Ruta activa
              </p>
              <p className="text-slate-300">Origen → Destino</p>
              <p className="text-cyan-400 mt-1">Riesgo prom: 58.3</p>
            </div>

            {/* Coordinates watermark */}
            <p className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-700">
              3.4516° N · 76.5320° O
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Flow ---

type FlowStepProps = {
  step: string;
  title: string;
  description: string;
  isLast?: boolean;
};

function FlowStep({ step, title, description, isLast }: FlowStepProps) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0">
          {step}
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[36px] mt-2 bg-gradient-to-b from-cyan-500/20 to-transparent" />
        )}
      </div>
      <div className="pb-9">
        <h3 className="text-white font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );
}

function FlowSection() {
  return (
    <section id="flow" className="py-28 px-6 bg-[#050a14]">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-3">
            Flujo
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Cómo funciona
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
            El sistema analiza rutas urbanas en Cali evaluando el riesgo en
            cada segmento mediante un modelo diferencial que captura la
            dinámica temporal del peligro por comunas.
          </p>
        </div>
        <div>
          <FlowStep
            step="01"
            title="Origen y Destino"
            description="Selecciona punto de partida y llegada dentro del mapa urbano de Cali."
          />
          <FlowStep
            step="02"
            title="Ruta Urbana"
            description="El sistema calcula la ruta óptima a través de las comunas de la ciudad."
          />
          <FlowStep
            step="03"
            title="Análisis por Comunas"
            description="Cada segmento de la ruta se evalúa con datos de riesgo locales actualizados."
          />
          <FlowStep
            step="04"
            title="Evolución del Riesgo"
            description="Un modelo diferencial proyecta la dinámica del riesgo en el tiempo y el espacio."
            isLast
          />
        </div>
      </div>
    </section>
  );
}

// --- Footer ---

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5 bg-[#030609]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-sm font-semibold tracking-[0.18em] text-white/60 uppercase">
            Safe Maps
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-700">
          Proyecto académico · Universidad del Valle · Cali, Colombia
        </p>
      </div>
    </footer>
  );
}

// --- Page ---

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <MapPreview />
      <FlowSection />
      <Footer />
    </>
  );
}
