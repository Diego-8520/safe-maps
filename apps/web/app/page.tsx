import Link from "next/link";

// --- Icon components (inline SVG) ---

type IconProps = { className?: string };

function IconMap({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 20.5L3 17.5V3.5L9 6.5M9 20.5L15 17.5M9 20.5V6.5M15 17.5L21 20.5V6.5L15 3.5M15 17.5V3.5M9 6.5L15 3.5" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconFunction({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 5C13 5 12 7 12 9v6c0 2-1 4-3.5 4" />
      <path d="M8.5 9h7M8.5 15h7" />
    </svg>
  );
}

function IconArrow({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
          <circle
            key={r}
            cx="400"
            cy="400"
            r={r}
            fill="none"
            stroke="rgb(6,182,212)"
            strokeWidth="1"
          />
        ))}
        <line
          x1="400"
          y1="0"
          x2="400"
          y2="800"
          stroke="rgb(6,182,212)"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="400"
          x2="800"
          y2="400"
          stroke="rgb(6,182,212)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Corner meta */}
      <p className="absolute top-24 left-6 text-[10px] font-mono text-cyan-500/25 leading-relaxed hidden md:block">
        3.4516° N<br />
        76.5320° O
      </p>
      <p className="absolute top-24 right-6 text-[10px] font-mono text-cyan-500/25 leading-relaxed text-right hidden md:block">
        CALI · COL
        <br />
        ZONA URBANA
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
          <Link
            href="/map"
            className="group flex items-center gap-2.5 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg transition-all duration-200 text-sm uppercase tracking-wide"
          >
            Explorar mapa
            <IconArrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
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

const ACCENT: Record<string, { border: string; iconBg: string; icon: string }> =
  {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      iconBg: "bg-cyan-500/10",
      icon: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10",
      icon: "text-emerald-400",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      iconBg: "bg-amber-500/10",
      icon: "text-amber-400",
    },
  };

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: FeatureCardProps) {
  const a = ACCENT[accent];
  return (
    <div
      className={`p-6 rounded-2xl border ${a.border} bg-white/[0.02] backdrop-blur-sm transition-all duration-300`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center mb-5`}
      >
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
            description="Ecuación diferencial resuelta con Euler para modelar la evolución del riesgo acumulado por distancia."
            accent="amber"
          />
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
  detail: string;
  reference: string;
};

const FLOW_STEPS: FlowStepProps[] = [
  {
    step: "01",
    title: "Ruta real",
    description:
      "OpenRouteService entrega la geometría de la ruta entre origen y destino.",
    detail:
      "El sistema trabaja sobre coordenadas reales de la vía, no sobre una línea dibujada manualmente.",
    reference: "normalizeOpenRouteResponse()",
  },
  {
    step: "02",
    title: "Segmentación",
    description:
      "La geometría se divide en tramos continuos de aproximadamente 400 metros.",
    detail:
      "Cada tramo conserva sus coordenadas y distancia para que Euler avance con un delta espacial medible.",
    reference: "TARGET_SEGMENT_METERS = 400",
  },
  {
    step: "03",
    title: "Cruce geográfico",
    description:
      "El punto medio de cada segmento se cruza contra los polígonos de comunas.",
    detail:
      "Así cada tramo hereda una comuna de análisis sin romper la continuidad de la ruta.",
    reference: "findCommuneForPoint()",
  },
  {
    step: "04",
    title: "Riesgo local",
    description:
      "Supabase aporta el perfil de riesgo de la comuna asociada al tramo.",
    detail:
      "Las variables criminalidad, seguridad, vigilancia, iluminación y flujo alimentan risk_score; Euler usa ese score como L.",
    reference: "commune_risk_profiles.risk_score",
  },
  {
    step: "05",
    title: "Condición inicial",
    description:
      "El acumulado inicia con el riesgo de la comuna donde comienza la ruta.",
    detail:
      "R(0) no es arbitrario: se toma desde initialRiskScore antes de recorrer los segmentos.",
    reference: "initialRiskScore",
  },
  {
    step: "06",
    title: "Ecuación diferencial",
    description:
      "El riesgo acumulado R evoluciona hacia el riesgo local L del segmento actual.",
    detail:
      "Si L es mayor que R, el acumulado sube; si L es menor, baja gradualmente; si son iguales, se mantiene.",
    reference: "dR/dx = k(L - R)",
  },
  {
    step: "07",
    title: "Método de Euler",
    description:
      "Cada segmento aplica una aproximación numérica usando su longitud en kilómetros.",
    detail:
      "El nuevo valor se limita al rango 0-100 para conservar la escala de riesgo del sistema.",
    reference: "calculateEulerRiskEvolution()",
  },
  {
    step: "08",
    title: "Evolución del riesgo",
    description:
      "El resultado de cada paso se guarda como riesgo acumulado del segmento.",
    detail:
      "localRiskScore describe la comuna actual; accumulatedRiskScore describe la historia recorrida hasta ese punto.",
    reference: "accumulatedRiskScore",
  },
  {
    step: "09",
    title: "Visualización final",
    description:
      "La UI recibe segmentos enriquecidos con riesgo local, acumulado y nivel de clasificación.",
    detail:
      "El mapa y los paneles pueden explicar no solo dónde hay riesgo, sino cómo cambia a lo largo de la ruta.",
    reference: "RouteAnalysis.segments",
  },
];

function ReferenceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/80">
      {children}
    </span>
  );
}

function FlowStep({ step, title, description, detail, reference }: FlowStepProps) {
  return (
    <article className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-colors duration-200 hover:border-cyan-500/30">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-semibold text-cyan-400">
          {step}
        </span>
        <ReferenceBadge>{reference}</ReferenceBadge>
      </div>
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-300">{description}</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{detail}</p>
    </article>
  );
}

function PipelineRail() {
  const stages = [
    "OpenRouteService",
    "segmentByDistance()",
    "findCommuneForPoint()",
    "findRiskByCommune()",
    "Euler",
    "UI",
  ];

  return (
    <div className="rounded-xl border border-cyan-500/15 bg-[#06101d] p-4">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
        Pipeline real
      </p>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-2">
            <div className="min-h-12 flex-1 rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2">
              <p className="font-mono text-[10px] leading-relaxed text-slate-300">
                {stage}
              </p>
            </div>
            {index < stages.length - 1 && (
              <IconArrow className="hidden h-3.5 w-3.5 shrink-0 text-cyan-500/60 lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowSection() {
  return (
    <section id="flow" className="px-6 py-28 bg-[#03070f]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-mono uppercase tracking-widest text-cyan-400">
              Metodología
            </p>
            <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
              Cómo funciona
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              Safe Maps toma una ruta urbana real, la discretiza en segmentos,
              consulta el riesgo local por comuna y calcula la evolución del
              riesgo acumulado con una ecuación diferencial aproximada por Euler.
              El resultado es defendible como modelo académico de exposición
              relativa, no como predicción criminal.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.045] p-5">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-amber-300">
                Ecuación implementada
              </p>
              <p className="font-mono text-lg text-white">dR/dx = k(L - R)</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                R es el riesgo acumulado. L es el riesgo local del segmento. En
                euler-v1, k = 1.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                Fuente de riesgo local
              </p>
              <p className="font-mono text-sm leading-relaxed text-white">
                risk_score -&gt; localRiskScore -&gt; Euler
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Supabase entrega perfiles por comuna; el integrador usa
                directamente risk_score como objetivo local del tramo.
              </p>
            </div>
          </div>
        </div>

        <PipelineRail />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FLOW_STEPS.map((item) => (
            <FlowStep key={item.step} {...item} />
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              Paso numérico por segmento
            </p>
            <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-[11px] leading-relaxed text-slate-300">
              <code>{`const derivative = k * (localRiskScore - current);
const next = clamp(current + derivative * deltaKm, 0, 100);`}</code>
            </pre>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              La operación se repite para cada segmento. La longitud del tramo
              convierte la ruta en una sucesión de pasos espaciales deltaKm, por
              eso el acumulado no cambia bruscamente al entrar en una comuna
              distinta.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              Referencias del código
            </p>
            <div className="flex flex-wrap gap-2">
              <ReferenceBadge>apps/web/lib/routes/route-segmentation.ts</ReferenceBadge>
              <ReferenceBadge>apps/web/lib/routes/normalize-openroute-route.ts</ReferenceBadge>
              <ReferenceBadge>apps/web/lib/risk/euler-risk-integrator.ts</ReferenceBadge>
              <ReferenceBadge>apps/web/lib/risk/euler-accumulated-route-risk.ts</ReferenceBadge>
              <ReferenceBadge>SupabaseCommuneRiskRepository.getAll()</ReferenceBadge>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Tablas principales: communes, commune_risk_profiles,
              risk_model_versions, risk_model_coefficients,
              annual_crime_indicators, risk_time_windows y data_sources.
            </p>
          </div>
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
          Proyecto académico · Cali, Colombia
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
      <FlowSection />
      <Footer />
    </>
  );
}
