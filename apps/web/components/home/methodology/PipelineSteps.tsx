import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "cyan" | "emerald" | "amber" | "violet";
type StepVariant = "standard" | "equation-hero" | "euler-hero" | "curve-hero";

type StepData = {
  step: string;
  phase: Phase;
  variant?: StepVariant;
  title: string;
  subtitle: string;
  intuition: string;
  technical: string;
  inputs: string[];
  process: string;
  outputs: string[];
  formula?: string;
  formulaNote?: string;
  whyMatters: string;
  reference?: string;
};

type PhaseGroup = {
  label: string;
  color: Phase;
  steps: StepData[];
};

type S = {
  accent: string;
  border: string;
  gradient: string;
  dot: string;
  badge: string;
  io: string;
  formulaBox: string;
  why: string;
  line: string;
  heroBg: string;
};

// ─── Phase styles ─────────────────────────────────────────────────────────────

const PS: Record<Phase, S> = {
  cyan: {
    accent: "text-cyan-400",
    border: "border-cyan-500/25",
    gradient: "from-cyan-500/4",
    dot: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    io: "border-cyan-500/20 bg-cyan-500/4",
    formulaBox: "border-cyan-500/20 bg-cyan-500/3",
    why: "border-l-cyan-500/50",
    line: "bg-cyan-500/20",
    heroBg: "from-cyan-500/6 via-cyan-500/3",
  },
  emerald: {
    accent: "text-emerald-400",
    border: "border-emerald-500/25",
    gradient: "from-emerald-500/4",
    dot: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    io: "border-emerald-500/20 bg-emerald-500/4",
    formulaBox: "border-emerald-500/20 bg-emerald-500/3",
    why: "border-l-emerald-500/50",
    line: "bg-emerald-500/20",
    heroBg: "from-emerald-500/6 via-emerald-500/3",
  },
  amber: {
    accent: "text-amber-400",
    border: "border-amber-500/25",
    gradient: "from-amber-500/4",
    dot: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    io: "border-amber-500/20 bg-amber-500/4",
    formulaBox: "border-amber-500/20 bg-amber-500/3",
    why: "border-l-amber-500/50",
    line: "bg-amber-500/20",
    heroBg: "from-amber-500/8 via-amber-500/4",
  },
  violet: {
    accent: "text-violet-400",
    border: "border-violet-500/25",
    gradient: "from-violet-500/4",
    dot: "border-violet-500/50 bg-violet-500/10 text-violet-400",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    io: "border-violet-500/20 bg-violet-500/4",
    formulaBox: "border-violet-500/20 bg-violet-500/3",
    why: "border-l-violet-500/50",
    line: "bg-violet-500/20",
    heroBg: "from-violet-500/6 via-violet-500/3",
  },
};

// ─── Step data ────────────────────────────────────────────────────────────────

const STEPS: StepData[] = [
  {
    step: "01",
    phase: "cyan",
    title: "Ruta real desde OpenRouteService",
    subtitle:
      "El sistema no dibuja una línea recta. Pide el camino exacto por las calles.",
    intuition:
      "Cuando buscas una ruta, el sistema no asume que vas en línea recta. Pide a un servicio externo el trayecto real: giros, calles y distancias incluidos. Eso le da una geometría honesta sobre la que trabajar.",
    technical:
      "OpenRouteService retorna un GeoJSON con una LineString. El backend normaliza la respuesta extrayendo la secuencia ordenada de coordenadas [lng, lat] que describe la traza real de la vía.",
    inputs: [
      "coordenada de origen (lng, lat)",
      "coordenada de destino (lng, lat)",
    ],
    process: "POST /directions → OpenRouteService → GeoJSON LineString",
    outputs: [
      "polyline: secuencia de N coordenadas reales",
      "distancia total en metros",
    ],
    whyMatters:
      "Sin geometría real, los segmentos no tendrían posición geográfica válida. El cruce con comunas, el riesgo local y la integración de Euler dependen de coordenadas de calles reales.",
    reference: "normalizeOpenRouteResponse()",
  },
  {
    step: "02",
    phase: "cyan",
    title: "División en segmentos continuos de ~400 m",
    subtitle:
      "La ruta completa se corta en tramos pequeños. Cada tramo tendrá su propio riesgo.",
    intuition:
      "Si la ruta tiene 5 km, el sistema la divide en pedazos de ~400 m, como leer una frase palabra por palabra en vez de todo de golpe. Así puede estudiar qué zona atraviesa cada trozo por separado.",
    technical:
      "La polyline se recorre acumulando distancia haversine. Cuando supera TARGET_SEGMENT_METERS (400 m) se cierra el tramo y comienza uno nuevo. Cada segmento almacena coordenadas de inicio, fin, punto medio y su deltaKm.",
    inputs: ["polyline con N coordenadas", "TARGET_SEGMENT_METERS = 400"],
    process: "acumular distancia haversine → corte cada 400 m → nuevo segmento",
    outputs: [
      "RouteSegment[] con ≈ distanciaTotal / 400 elementos",
      "cada segmento: coordenadas + punto medio + deltaKm",
    ],
    whyMatters:
      "Euler necesita pasos discretos con longitud medible. Sin deltaKm no existe la variable Δx de la integral numérica. Sin segmentos, el modelo no puede avanzar.",
    reference: "segmentByDistance()",
  },
  {
    step: "03",
    phase: "emerald",
    title: "Cada segmento encuentra su comuna",
    subtitle:
      "El punto medio de cada tramo se cruza con los polígonos de las 22 comunas.",
    intuition:
      "Cada tramo vive dentro de alguna zona de la ciudad. El sistema calcula el punto central del tramo y pregunta: ¿dentro de qué polígono de comuna cae este punto? La respuesta le da identidad geográfica al segmento.",
    technical:
      "Para cada segmento se computa el punto medio de sus coordenadas. Ese punto se evalúa contra los polígonos GeoJSON de las comunas usando point-in-polygon. El segmento hereda el communeId del polígono que lo contiene.",
    inputs: [
      "RouteSegment[] con punto medio calculado",
      "polígonos GeoJSON de 22 comunas de Cali",
    ],
    process: "punto medio → point-in-polygon sobre 22 polígonos → communeId",
    outputs: ["cada RouteSegment + communeId asignado"],
    whyMatters:
      "Sin communeId el sistema no sabe de dónde obtener el riesgo local. El segmento necesita identidad geográfica antes de consultar Supabase.",
    reference: "findCommuneForPoint()",
  },
  {
    step: "04",
    phase: "emerald",
    title: "Riesgo local L desde Supabase",
    subtitle:
      "Supabase entrega el risk_score de la comuna. Ese número se convierte en L.",
    intuition:
      "La base de datos tiene un número entre 0 y 100 para cada zona de Cali. Ese número resume la exposición relativa al riesgo urbano. El sistema lo toma y lo asigna al segmento como su 'nivel de ambiente'.",
    technical:
      "El repositorio consulta commune_risk_profiles filtrando por communeId. El campo risk_score (normalizado 0–100) se asigna al segmento como localRiskScore. Este valor es exactamente L en la ecuación diferencial.",
    inputs: [
      "communeId de cada segmento",
      "tabla commune_risk_profiles en Supabase",
    ],
    process: "SELECT risk_score WHERE commune_id = communeId",
    outputs: [
      "localRiskScore ∈ [0, 100] por segmento",
      "L listo para la ecuación diferencial",
    ],
    whyMatters:
      "L es la fuerza de atracción del modelo. Sin risk_score la ecuación no tiene objetivo hacia dónde converger.",
    reference: "commune_risk_profiles.risk_score",
  },
  {
    step: "05",
    phase: "amber",
    title: "Condición inicial R(0)",
    subtitle:
      "El integrador no empieza desde cero. Arranca con el riesgo real del punto de origen.",
    intuition:
      "Antes de caminar ya estás en algún lugar con su propio nivel de riesgo. El modelo toma el riesgo de la primera zona que pisas como punto de partida. Así el resultado es coherente desde el primer metro.",
    technical:
      "R(0) se inicializa con el localRiskScore del primer segmento. Esto garantiza continuidad matemática: la condición inicial no es arbitraria sino un dato real del ambiente de partida.",
    inputs: ["localRiskScore del primer segmento (índice 0)"],
    process: "R(0) ← segments[0].localRiskScore",
    outputs: [
      "initialRiskScore = R(0)",
      "punto de partida del integrador numérico",
    ],
    formula: "R(0) = localRiskScore[0]",
    formulaNote:
      "Iniciar con R(0) = 0 sería arbitrario y distorsionaría el resultado.",
    whyMatters:
      "La condición inicial ancla el modelo a la realidad. Un origen en una zona de riesgo alto debe reflejarse desde el primer tramo.",
    reference: "initialRiskScore",
  },
  {
    step: "06",
    phase: "amber",
    variant: "equation-hero",
    title: "La ecuación diferencial dR/dx = k(L − R)",
    subtitle:
      "El riesgo acumulado es atraído hacia el riesgo local. Nunca cambia de golpe.",
    intuition:
      "Si la zona que estás cruzando es más peligrosa que lo vivido hasta ahora, tu exposición sube lentamente hacia ese nivel. Si es más tranquila, baja poco a poco. La ecuación captura esa lógica: el acumulado siempre se mueve hacia el nivel local, sin saltos abruptos.",
    technical:
      "La EDO modela atracción proporcional a la diferencia entre el riesgo local L y el acumulado R. Con k = 1 (euler-v1), por cada kilómetro recorrido R avanza un porcentaje de la brecha (L − R).",
    inputs: [
      "R: riesgo acumulado actual",
      "L: riesgo local del segmento (localRiskScore)",
      "k = 1 (constante euler-v1)",
    ],
    process: "derivative = k × (L − R)",
    outputs: ["tasa de cambio dR/dx", "dirección y magnitud del ajuste"],
    formula: "dR/dx = k(L − R)",
    formulaNote: "L > R → R sube   ·   L < R → R baja   ·   L = R → R estable",
    whyMatters:
      "Sin esta ecuación el riesgo acumulado cambiaría abruptamente al cruzar fronteras de comunas. La EDO produce una curva suave que modela exposición progresiva.",
    reference: "dR/dx = k(L − R)",
  },
  {
    step: "07",
    phase: "amber",
    variant: "euler-hero",
    title: "Método de Euler: la EDO en pasos discretos",
    subtitle:
      "Euler convierte la ecuación continua en una operación aplicable segmento a segmento.",
    intuition:
      "No existe una fórmula mágica que resuelva dR/dx = k(L−R) sobre una ruta irregular. Euler avanza un pasito a la vez: calcula cuánto cambia R en este tramo, aplica ese cambio y pasa al siguiente con el nuevo valor.",
    technical:
      "El método de Euler forward aplica R(x+Δx) ≈ R(x) + f(R,x)·Δx, donde f(R,x) = k·(L−R) y Δx = deltaKm del segmento. El resultado se limita a [0, 100] con clamp.",
    inputs: [
      "R actual: riesgo acumulado del paso anterior",
      "derivative = k(L − R)",
      "deltaKm: longitud del segmento en km",
    ],
    process: "next = clamp(R + derivative × deltaKm, 0, 100)",
    outputs: [
      "R nuevo = accumulatedRiskScore del segmento",
      "input del próximo paso de Euler",
    ],
    formula: "R[i+1] = clamp(R[i] + k·(L−R[i])·Δx, 0, 100)",
    formulaNote:
      "Δx = deltaKm · Tramos largos producen ajustes mayores · clamp mantiene R ∈ [0, 100]",
    whyMatters:
      "Sin Euler no hay forma de integrar la EDO sobre segmentos de longitud variable. La aproximación numérica es lo que permite resolver el modelo sobre una ruta real.",
    reference: "calculateEulerRiskEvolution()",
  },
  {
    step: "08",
    phase: "amber",
    variant: "curve-hero",
    title: "Evolución acumulada a lo largo de toda la ruta",
    subtitle:
      "Cada segmento guarda dos valores distintos: el riesgo de su zona y su historia acumulada.",
    intuition:
      "Euler no produce un solo número sino una historia: cómo fue cambiando tu exposición a medida que avanzabas. Al llegar, puedes ver exactamente en qué tramo subió y en cuál bajó.",
    technical:
      "El output de cada paso Euler se convierte en el input del siguiente, construyendo la serie temporal de R. Cada RouteSegment almacena simultáneamente localRiskScore (el ambiente, L) y accumulatedRiskScore (el historial, R). Son magnitudes distintas.",
    inputs: [
      "R[i−1]: acumulado del segmento anterior",
      "L[i]: riesgo local del segmento actual",
      "deltaKm[i]: longitud del segmento",
    ],
    process: "R[i] = Euler(R[i−1], L[i], Δx[i]) → repite para i = 0…n",
    outputs: [
      "localRiskScore por segmento: el ambiente de la zona (L)",
      "accumulatedRiskScore por segmento: la historia de exposición (R)",
      "riskLevel por segmento: low | medium | high",
    ],
    whyMatters:
      "La distinción entre riesgo local y acumulado es el corazón del modelo. El local describe el ambiente puntual; el acumulado describe cuánto riesgo se ha integrado durante el trayecto completo.",
    reference: "accumulatedRiskScore",
  },
  {
    step: "09",
    phase: "violet",
    title: "Visualización en mapa y paneles de análisis",
    subtitle:
      "Los números se convierten en colores, gráficas y detalle por segmento consultable.",
    intuition:
      "Todo el procesamiento anterior produce segmentos llenos de datos. La interfaz los convierte en algo legible: el mapa colorea cada tramo y el panel lateral muestra cómo evolucionó el acumulado a lo largo del recorrido.",
    technical:
      "El frontend recibe RouteAnalysis.segments con localRiskScore, accumulatedRiskScore y riskLevel por tramo. MapLibre renderiza la ruta coloreando cada segmento. El panel lateral pagina los segmentos y muestra la evolución numérica de R.",
    inputs: [
      "RouteAnalysis.segments[]",
      "localRiskScore + accumulatedRiskScore + riskLevel por segmento",
    ],
    process: "segmentos → capas GeoJSON en MapLibre + panel lateral paginado",
    outputs: [
      "ruta coloreada por riskLevel (low / medium / high)",
      "panel con evolución de R a lo largo de x",
      "detalle numérico por segmento consultable",
    ],
    whyMatters:
      "Sin visualización el modelo es un número en memoria. La UI convierte el resultado numérico en información comprensible: el usuario puede ver dónde aumenta su exposición.",
    reference: "RouteAnalysis.segments",
  },
];

const PHASE_GROUPS: PhaseGroup[] = [
  {
    label: "Fase I · Geometría Real",
    color: "cyan",
    steps: [STEPS[0], STEPS[1]],
  },
  {
    label: "Fase II · Enriquecimiento Geográfico",
    color: "emerald",
    steps: [STEPS[2], STEPS[3]],
  },
  {
    label: "Fase III · Integración Numérica",
    color: "amber",
    steps: [STEPS[4], STEPS[5], STEPS[6], STEPS[7]],
  },
  { label: "Fase IV · Resultados", color: "violet", steps: [STEPS[8]] },
];

// ─── Math fraction helper ─────────────────────────────────────────────────────

function MathFrac({
  num,
  den,
  className = "",
}: {
  num: React.ReactNode;
  den: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ lineHeight: 1.2 }}
    >
      <span className="pb-0.75 font-bold">{num}</span>
      <span
        className="block w-full"
        style={{
          height: 1.5,
          backgroundColor: "currentColor",
          borderRadius: 1,
        }}
      />
      <span className="pt-0.75 font-bold">{den}</span>
    </span>
  );
}

// ─── Math subscript helper ────────────────────────────────────────────────────

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "0.58em", verticalAlign: "sub", lineHeight: 0 }}>
      {children}
    </span>
  );
}

// ─── Reusable IO section ──────────────────────────────────────────────────────

function IOFlow({ data, s }: { data: StepData; s: S }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className={`flex-1 rounded-xl border p-3 ${s.io}`}>
        <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Entrada
        </p>
        <ul className="space-y-1.5">
          {data.inputs.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 font-mono text-[10px] leading-relaxed text-slate-300"
            >
              <span className={`mt-px shrink-0 text-[8px] ${s.accent}`}>▸</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`flex items-center justify-center py-1 text-sm sm:px-1 ${s.accent} opacity-40`}
      >
        →
      </div>

      <div className="flex-[1.2] rounded-xl border border-slate-700/40 bg-slate-900/50 p-3">
        <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Proceso
        </p>
        <p className="font-mono text-[10px] leading-relaxed text-slate-300">
          {data.process}
        </p>
      </div>

      <div
        className={`flex items-center justify-center py-1 text-sm sm:px-1 ${s.accent} opacity-40`}
      >
        →
      </div>

      <div className={`flex-1 rounded-xl border p-3 ${s.io}`}>
        <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Salida
        </p>
        <ul className="space-y-1.5">
          {data.outputs.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 font-mono text-[10px] leading-relaxed text-slate-300"
            >
              <span className={`mt-px shrink-0 text-[8px] ${s.accent}`}>▸</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Explanations({ data }: { data: StepData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Intuición
        </p>
        <p className="text-xs leading-relaxed text-slate-400">
          {data.intuition}
        </p>
      </div>
      <div>
        <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Técnico
        </p>
        <p className="text-xs leading-relaxed text-slate-400">
          {data.technical}
        </p>
      </div>
    </div>
  );
}

function WhyMatters({ data, s }: { data: StepData; s: S }) {
  return (
    <div className={`border-l-2 pl-3 ${s.why}`}>
      <p className="mb-0.5 text-[9px] font-mono uppercase tracking-widest text-slate-600">
        Por qué importa
      </p>
      <p className="text-xs leading-relaxed text-slate-500">
        {data.whyMatters}
      </p>
    </div>
  );
}

function StepHeader({ data, s }: { data: StepData; s: S }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${s.dot}`}
        >
          {data.step}
        </span>
        <div>
          <p
            className={`mb-0.5 text-[10px] font-mono uppercase tracking-widest ${s.accent}`}
          >
            Paso {data.step}
          </p>
          <h3 className="text-base font-semibold leading-tight text-white">
            {data.title}
          </h3>
        </div>
      </div>
      {data.reference && (
        <span className="hidden shrink-0 rounded-md border border-slate-700/60 bg-slate-950/70 px-2 py-1 font-mono text-[10px] leading-none text-cyan-300/70 sm:inline-flex">
          {data.reference}
        </span>
      )}
    </div>
  );
}

// ─── Standard card (phases I, II, IV, and step 05) ────────────────────────────

function StandardCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-6 backdrop-blur-sm ${s.border} ${s.gradient}`}
    >
      <div className="mb-4">
        <StepHeader data={data} s={s} />
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-400">
        {data.subtitle}
      </p>
      <div className="mb-5">
        <IOFlow data={data} s={s} />
      </div>
      <div className="mb-4">
        <Explanations data={data} />
      </div>
      {data.formula && (
        <div
          className={`mb-4 rounded-xl border p-4 text-center ${s.formulaBox}`}
        >
          <p
            className={`font-mono text-xl font-semibold tracking-wide ${s.accent}`}
          >
            {data.formula}
          </p>
          {data.formulaNote && (
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {data.formulaNote}
            </p>
          )}
        </div>
      )}
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Polyline mini SVG (step 01) ──────────────────────────────────────────────

function PolylineSVG() {
  return (
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/3 p-3">
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
        geometría real de la vía
      </p>
      <svg viewBox="0 0 200 60" className="w-full opacity-70">
        <path
          d="M 10,45 L 30,40 L 45,25 L 60,28 L 80,20 L 100,22 L 120,30 L 145,15 L 165,18 L 190,10"
          fill="none"
          stroke="rgba(34,211,238,0.6)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="45" r="3" fill="#22d3ee" opacity="0.9" />
        <circle cx="190" cy="10" r="3" fill="#22d3ee" opacity="0.9" />
        <text
          x="5"
          y="56"
          fontSize="6"
          fill="rgba(34,211,238,0.6)"
          fontFamily="monospace"
        >
          A
        </text>
        <text
          x="187"
          y="8"
          fontSize="6"
          fill="rgba(34,211,238,0.6)"
          fontFamily="monospace"
        >
          B
        </text>
      </svg>
    </div>
  );
}

// ─── Segmentation mini SVG (step 02) ─────────────────────────────────────────

function SegmentationSVG() {
  const segments = [
    { x1: 10, x2: 53 },
    { x1: 53, x2: 96 },
    { x1: 96, x2: 139 },
    { x1: 139, x2: 182 },
  ];
  const colors = [
    "rgba(34,211,238,0.8)",
    "rgba(52,211,153,0.7)",
    "rgba(251,191,36,0.7)",
    "rgba(167,139,250,0.7)",
  ];

  return (
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/3 p-3">
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
        segmentos de ~400 m
      </p>
      <svg viewBox="0 0 200 40" className="w-full opacity-80">
        {segments.map(({ x1, x2 }, i) => (
          <g key={i}>
            <line
              x1={x1}
              y1="20"
              x2={x2}
              y2="20"
              stroke={colors[i]}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={x1} cy="20" r="2.5" fill={colors[i]} />
            <text
              x={(x1 + x2) / 2 - 6}
              y="35"
              fontSize="5.5"
              fill="rgba(148,163,184,0.6)"
              fontFamily="monospace"
            >
              ~400m
            </text>
          </g>
        ))}
        <circle cx="182" cy="20" r="2.5" fill="rgba(167,139,250,0.7)" />
      </svg>
    </div>
  );
}

// ─── Commune polygon mini SVG (step 03) ───────────────────────────────────────

function CommuneSVG() {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/3 p-3">
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
        point-in-polygon · comunas
      </p>
      <svg viewBox="0 0 200 60" className="w-full opacity-75">
        <polygon
          points="10,10 80,5  85,55  5,50"
          fill="none"
          stroke="rgba(52,211,153,0.25)"
          strokeWidth="1"
        />
        <polygon
          points="80,5  170,8  165,52 85,55"
          fill="rgba(52,211,153,0.08)"
          stroke="rgba(52,211,153,0.50)"
          strokeWidth="1.2"
        />
        <polygon
          points="165,52 195,50 195,8 170,8"
          fill="none"
          stroke="rgba(52,211,153,0.25)"
          strokeWidth="1"
        />
        <text
          x="30"
          y="32"
          fontSize="6"
          fill="rgba(52,211,153,0.4)"
          fontFamily="monospace"
        >
          C13
        </text>
        <text
          x="110"
          y="32"
          fontSize="6"
          fill="rgba(52,211,153,0.8)"
          fontFamily="monospace"
        >
          C14
        </text>
        <text
          x="175"
          y="32"
          fontSize="6"
          fill="rgba(52,211,153,0.4)"
          fontFamily="monospace"
        >
          C15
        </text>
        <circle cx="125" cy="29" r="3" fill="rgba(251,191,36,0.9)" />
        <circle
          cx="125"
          cy="29"
          r="6"
          fill="none"
          stroke="rgba(251,191,36,0.4)"
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />
        <text
          x="132"
          y="24"
          fontSize="5.5"
          fill="rgba(251,191,36,0.7)"
          fontFamily="monospace"
        >
          punto medio
        </text>
      </svg>
    </div>
  );
}

// ─── Supabase data flow mini visual (step 04) ─────────────────────────────────

function SupabaseViz() {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/3 p-3">
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
        commune_risk_profiles · Supabase
      </p>
      <div className="space-y-1.5">
        {[
          { commune: "C14", score: 74, color: "bg-rose-400" },
          { commune: "C07", score: 38, color: "bg-emerald-400" },
          { commune: "C20", score: 61, color: "bg-amber-400" },
        ].map(({ commune, score, color }) => (
          <div key={commune} className="flex items-center gap-2">
            <span className="w-7 shrink-0 font-mono text-[9px] text-slate-500">
              {commune}
            </span>
            <div className="flex-1 rounded-full bg-slate-800/60">
              <div
                className={`h-1.5 rounded-full ${color} opacity-70`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right font-mono text-[9px] text-slate-400">
              {score}
            </span>
          </div>
        ))}
        <p className="mt-2 font-mono text-[8px] text-slate-600">
          risk_score normalizado 0 → 100
        </p>
      </div>
    </div>
  );
}

// ─── Geometry-phase card (steps 01–02 with mini SVGs) ────────────────────────

function GeometryCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-6 backdrop-blur-sm ${s.border} ${s.gradient}`}
    >
      <div className="mb-4">
        <StepHeader data={data} s={s} />
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-400">
        {data.subtitle}
      </p>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <IOFlow data={data} s={s} />
        {data.step === "01" ? <PolylineSVG /> : <SegmentationSVG />}
      </div>

      <div className="mb-4">
        <Explanations data={data} />
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Geographic-phase card (steps 03–04 with mini visuals) ───────────────────

function GeographicCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-6 backdrop-blur-sm ${s.border} ${s.gradient}`}
    >
      <div className="mb-4">
        <StepHeader data={data} s={s} />
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-400">
        {data.subtitle}
      </p>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <IOFlow data={data} s={s} />
        {data.step === "03" ? <CommuneSVG /> : <SupabaseViz />}
      </div>

      <div className="mb-4">
        <Explanations data={data} />
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Hero: Equation (step 06) ─────────────────────────────────────────────────

const BEHAVIOR = [
  {
    cond: "L > R",
    effect: "R sube hacia L",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    cond: "L < R",
    effect: "R baja hacia L",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    cond: "L = R",
    effect: "R estable",
    color: "text-slate-400 border-slate-600/40 bg-slate-700/20",
  },
] as const;

function EquationHeroCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-8 backdrop-blur-sm ${s.border} ${s.heroBg}`}
    >
      <div className="mb-6">
        <StepHeader data={data} s={s} />
      </div>

      {/* HERO: math formula */}
      <div
        className={`mb-6 rounded-2xl border py-10 px-6 text-center ${s.formulaBox}`}
      >
        <div
          className={`mb-3 flex items-center justify-center gap-3 text-4xl md:text-5xl ${s.accent}`}
        >
          <MathFrac num="dR" den="dx" className="text-3xl md:text-4xl" />
          <span className="text-slate-400">=</span>
          <span className="text-slate-300">k</span>
          <span className="text-slate-500 text-3xl">(</span>
          <span className="text-emerald-300">L</span>
          <span className="text-slate-500"> −</span>
          <span className="text-cyan-300">R</span>
          <span className="text-slate-500 text-3xl">)</span>
        </div>
        <p className="text-[11px] font-mono text-slate-600">
          ecuación diferencial ordinaria · método de Euler
        </p>
      </div>

      {/* Variable legend */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { sym: "R(x)", desc: "Riesgo acumulado", color: "text-cyan-300" },
          { sym: "x", desc: "Distancia en km", color: "text-slate-300" },
          { sym: "L", desc: "Riesgo local", color: "text-emerald-300" },
          { sym: "k = 1", desc: "Sensibilidad Euler", color: "text-amber-300" },
        ].map(({ sym, desc, color }) => (
          <div
            key={sym}
            className="rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-2"
          >
            <p className={`mb-0.5 font-mono text-sm font-bold ${color}`}>
              {sym}
            </p>
            <p className="text-[10px] leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Behavior table */}
      <div className="mb-6 flex flex-wrap gap-2">
        {BEHAVIOR.map(({ cond, effect, color }) => (
          <span
            key={cond}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[11px] ${color}`}
          >
            <span className="font-semibold">{cond}</span>
            <span className="text-slate-600">→</span>
            <span>{effect}</span>
          </span>
        ))}
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Intuición
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            {data.intuition}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Técnico
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            {data.technical}
          </p>
        </div>
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Hero: Euler step-by-step (step 07) ──────────────────────────────────────

const EULER_SIM = [
  { label: "R₀", value: 42, delay: "0.1s" },
  { label: "R₁", value: 56, delay: "0.4s" },
  { label: "R₂", value: 65, delay: "0.7s" },
  { label: "R₃", value: 70, delay: "1.0s" },
  { label: "R₄", value: 73, delay: "1.3s" },
  { label: "R₅", value: 75, delay: "1.6s" },
];
const L_SIM = 78;

function EulerHeroCard({ data, s }: { data: StepData; s: S }) {
  const walkthroughSteps: Array<{
    n: number;
    label: string;
    eq: React.ReactNode;
    note: string;
    highlight?: boolean;
    delay: string;
  }> = [
    {
      n: 1,
      label: "Riesgo acumulado actual",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-cyan-300">R<Sub>i</Sub></span>
          <span className="text-slate-400 mx-2">=</span>
          <span className="text-white font-bold">42</span>
        </span>
      ),
      note: "Lo que lleva la ruta hasta este tramo. Es el punto de partida del paso.",
      delay: "ehs-d1",
    },
    {
      n: 2,
      label: "Riesgo local de la comuna",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-emerald-300">L<Sub>i</Sub></span>
          <span className="text-slate-400 mx-2">=</span>
          <span className="text-white font-bold">78</span>
        </span>
      ),
      note: "El ambiente de la zona que atraviesa este segmento. Viene de Supabase.",
      delay: "ehs-d2",
    },
    {
      n: 3,
      label: "Diferencia entre L y R",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-emerald-300">L<Sub>i</Sub></span>
          <span className="text-slate-400 mx-1.5">−</span>
          <span className="text-cyan-300">R<Sub>i</Sub></span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-slate-400">78 − 42</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-amber-300 font-bold">36</span>
        </span>
      ),
      note: "Positivo: el ambiente es más riesgoso que lo acumulado. R debe subir.",
      highlight: true,
      delay: "ehs-d3",
    },
    {
      n: 4,
      label: "Multiplicar por k",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-amber-300">k</span>
          <span className="text-slate-500 mx-1.5">×</span>
          <span className="text-amber-200">36</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-slate-400">1 × 36</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-amber-300 font-bold">36</span>
        </span>
      ),
      note: "Con k = 1 la respuesta es directa. Un k menor haría la curva más lenta.",
      delay: "ehs-d4",
    },
    {
      n: 5,
      label: "Multiplicar por longitud del tramo",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-amber-200">36</span>
          <span className="text-slate-500 mx-1.5">×</span>
          <span className="text-amber-300">Δx<Sub>i</Sub></span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-slate-400">36 × 0.4</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-amber-300 font-bold">14.4</span>
        </span>
      ),
      note: "Tramos más largos producen mayor cambio. Δx = deltaKm del segmento.",
      delay: "ehs-d5",
    },
    {
      n: 6,
      label: "Actualizar el riesgo acumulado",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-cyan-300">R<Sub>i</Sub></span>
          <span className="text-slate-500 mx-1.5">+</span>
          <span className="text-amber-300">14.4</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-slate-400">42 + 14.4</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-white font-bold">56.4</span>
        </span>
      ),
      note: "Nuevo acumulado antes del clamp. Creció desde 42, pero no llegó a 78.",
      highlight: true,
      delay: "ehs-d6",
    },
    {
      n: 7,
      label: "Aplicar clamp [0, 100]",
      eq: (
        <span className="font-serif text-sm">
          <span className="text-slate-400">clamp(</span>
          <span className="text-white font-bold">56.4</span>
          <span className="text-slate-500">, 0, 100)</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-amber-300 font-bold">56.4</span>
          <span className="text-emerald-400 ml-2 text-xs">✓</span>
        </span>
      ),
      note: "Dentro del rango válido. El nuevo Rᵢ₊₁ = 56.4 entra al siguiente segmento.",
      delay: "ehs-d7",
    },
  ];

  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-8 backdrop-blur-sm ${s.border} ${s.heroBg}`}
    >
      <style>{`
        @keyframes ps-bar-grow {
          from { width: 0% }
          to   { width: var(--tw-bar-w) }
        }
        @keyframes ehs-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ps-euler-bar { animation: ps-bar-grow 1.4s cubic-bezier(0.34,1.2,0.64,1) both; }
        .ehs-step     { animation: ehs-fade-up 0.45s ease both; }
        .ehs-d1 { animation-delay: 0.05s; }
        .ehs-d2 { animation-delay: 0.20s; }
        .ehs-d3 { animation-delay: 0.35s; }
        .ehs-d4 { animation-delay: 0.50s; }
        .ehs-d5 { animation-delay: 0.65s; }
        .ehs-d6 { animation-delay: 0.80s; }
        .ehs-d7 { animation-delay: 0.95s; }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <StepHeader data={data} s={s} />
      </div>

      {/* ── Hero Formula ─────────────────────────────────────────────────────── */}
      <div className={`mb-8 rounded-2xl border py-10 px-6 ${s.formulaBox}`}>
        <p className="mb-5 text-center text-[9px] font-mono uppercase tracking-widest text-slate-600">
          Discretización del método de Euler forward
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-2 font-serif text-xl md:text-2xl">
            <span className="text-white">
              R<Sub>i+1</Sub>
            </span>
            <span className="text-slate-500 px-1">=</span>
            <span className="text-slate-400">clamp</span>
            <span className="text-slate-600 text-lg">(</span>
            <span className="text-cyan-300">
              R<Sub>i</Sub>
            </span>
            <span className="text-slate-500 px-0.5">+</span>
            <span className="text-amber-300">k</span>
            <span className="text-slate-500 text-lg">(</span>
            <span className="text-emerald-300">
              L<Sub>i</Sub>
            </span>
            <span className="text-slate-500 px-0.5">−</span>
            <span className="text-cyan-300">
              R<Sub>i</Sub>
            </span>
            <span className="text-slate-500 text-lg">)</span>
            <span className="text-amber-200">
              Δx<Sub>i</Sub>
            </span>
            <span className="text-slate-600 text-sm">,</span>
            <span className="text-slate-500 ml-1">0</span>
            <span className="text-slate-600 text-sm">,</span>
            <span className="text-slate-500 ml-1">100</span>
            <span className="text-slate-600 text-lg">)</span>
          </div>
          <div className="mt-2 rounded-lg border border-slate-700/30 bg-slate-900/50 px-5 py-2.5">
            <p className="text-center font-mono text-[11px] leading-relaxed text-slate-400">
              nuevo riesgo acumulado
              <span className="mx-2 text-slate-600">=</span>
              riesgo anterior
              <span className="mx-2 text-slate-600">+</span>
              cambio del tramo actual
            </p>
          </div>
        </div>
      </div>

      {/* ── Two columns: walkthrough + visual ──────────────────────────────────── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_260px]">

        {/* Step-by-step walkthrough */}
        <div className={`rounded-2xl border p-5 ${s.formulaBox}`}>
          <p className="mb-5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Ejemplo numérico · paso a paso
          </p>
          <div className="space-y-2.5">
            {walkthroughSteps.map(({ n, label, eq, note, highlight, delay }) => (
              <div
                key={n}
                className={`ehs-step ${delay} rounded-xl border p-3 ${
                  highlight
                    ? "border-amber-500/25 bg-amber-500/6"
                    : "border-slate-700/30 bg-slate-900/30"
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-bold ${s.dot}`}
                  >
                    {n}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    {label}
                  </span>
                </div>
                <div className="ml-7 mb-1">{eq}</div>
                <p className="ml-7 text-[10px] leading-relaxed text-slate-500">
                  {note}
                </p>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/6 p-4">
            <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-amber-400/70">
              Conclusión del ejemplo
            </p>
            <p className="text-xs leading-relaxed text-slate-300">
              Aunque el riesgo local era{" "}
              <span className="font-mono text-emerald-300">78</span>, el acumulado no
              saltó de <span className="font-mono text-cyan-300">42</span> a{" "}
              <span className="font-mono text-emerald-300">78</span>. Subió
              gradualmente a{" "}
              <span className="font-mono font-bold text-amber-300">56.4</span>. Así
              funciona Euler: avanza paso a paso, sin saltos bruscos.
            </p>
          </div>
        </div>

        {/* Right column: flow diagram + comparison bars */}
        <div className="flex flex-col gap-4">

          {/* Vertical computation flow */}
          <div className={`rounded-2xl border p-4 ${s.formulaBox}`}>
            <p className="mb-4 text-[9px] font-mono uppercase tracking-widest text-slate-500">
              Flujo de cálculo
            </p>
            <div className="flex flex-col items-stretch gap-1.5">

              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/6 p-2.5 text-center">
                  <p className="mb-0.5 font-mono text-[8px] text-slate-500">R actual</p>
                  <p className="font-serif text-xl font-bold text-cyan-300">42</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/6 p-2.5 text-center">
                  <p className="mb-0.5 font-mono text-[8px] text-slate-500">L local</p>
                  <p className="font-serif text-xl font-bold text-emerald-300">78</p>
                </div>
              </div>

              <div className="flex justify-center py-0.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[8px] text-slate-600">L − R</span>
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[9px] text-slate-600">↓</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-2.5 text-center">
                <p className="mb-0.5 font-mono text-[8px] text-slate-500">diferencia</p>
                <p className="font-serif text-xl font-bold text-amber-300">36</p>
              </div>

              <div className="flex justify-center py-0.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[8px] text-slate-600">× k (1)</span>
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[9px] text-slate-600">↓</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-2.5 text-center">
                <p className="mb-0.5 font-mono text-[8px] text-slate-500">derivative</p>
                <p className="font-serif text-xl font-bold text-amber-300">36</p>
              </div>

              <div className="flex justify-center py-0.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[8px] text-slate-600">× Δx (0.4)</span>
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[9px] text-slate-600">↓</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/4 p-2.5 text-center">
                <p className="mb-0.5 font-mono text-[8px] text-slate-500">cambio real</p>
                <p className="font-serif text-xl font-bold text-amber-300">14.4</p>
              </div>

              <div className="flex justify-center py-0.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[8px] text-slate-600">42 + 14.4</span>
                  <div className="h-3 w-px bg-slate-700/60" />
                  <span className="font-mono text-[9px] text-slate-600">↓</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-3 text-center">
                <p className="mb-0.5 font-mono text-[8px] uppercase tracking-widest text-amber-400/70">
                  R nuevo
                </p>
                <p className="font-serif text-2xl font-bold text-amber-300">56.4</p>
              </div>
            </div>
          </div>

          {/* Comparison bars */}
          <div className={`rounded-2xl border p-4 ${s.formulaBox}`}>
            <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-slate-500">
              R no llega a L de golpe
            </p>
            {[
              { label: "R actual", value: 42,   barClass: "bg-cyan-400/60",    textClass: "text-cyan-300",    barDelay: "0.1s", animated: true  },
              { label: "R nuevo",  value: 56.4, barClass: "bg-amber-400/60",   textClass: "text-amber-300",   barDelay: "0.5s", animated: true  },
              { label: "L local",  value: 78,   barClass: "bg-emerald-400/40", textClass: "text-emerald-300", barDelay: "0s",   animated: false },
            ].map(({ label, value, barClass, textClass, barDelay, animated }) => (
              <div key={label} className="mb-2.5">
                <div className="mb-1 flex justify-between">
                  <span className={`font-mono text-[9px] ${textClass}`}>{label}</span>
                  <span className={`font-mono text-[9px] tabular-nums ${textClass}`}>{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/80">
                  {animated ? (
                    <div
                      className={`ps-euler-bar h-full rounded-full ${barClass}`}
                      style={{ "--tw-bar-w": `${value}%`, animationDelay: barDelay } as React.CSSProperties}
                    />
                  ) : (
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${value}%` }} />
                  )}
                </div>
              </div>
            ))}
            <p className="mt-2 font-mono text-[8px] text-slate-600">
              R sube hacia L · sin saltos bruscos · clamp [0, 100]
            </p>
          </div>
        </div>
      </div>

      {/* ── Analogy ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-2xl border border-slate-700/30 bg-slate-900/40 p-5">
        <p className="mb-2.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Analogía · sin fórmulas
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          Imagina que{" "}
          <span className="font-mono text-cyan-300">R</span> es la temperatura que trae
          la ruta y{" "}
          <span className="font-mono text-emerald-300">L</span> es la temperatura del
          lugar donde entras. Si entras a un sitio más caliente, tu temperatura no
          cambia de golpe: empieza a subir poco a poco. Euler hace exactamente eso con
          el riesgo: mira hacia dónde debe moverse y avanza solo un pedacito según la
          distancia recorrida.
        </p>
      </div>

      {/* ── Code + variable mapping ───────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
        <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-slate-600">
          Código real · paso por segmento
        </p>
        <pre className="mb-5 overflow-x-auto rounded-lg border border-slate-800 bg-black/30 p-3 text-[11px] leading-relaxed text-slate-300">
          <code>{`const derivative = k * (localRiskScore - current);
const next = clamp(current + derivative * deltaKm, 0, 100);`}</code>
        </pre>

        <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-slate-600">
          Equivalencias · código ↔ fórmula
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {[
            { code: "current",        math: "Rᵢ",       desc: "riesgo acumulado antes del segmento",         color: "text-cyan-300"   },
            { code: "localRiskScore", math: "Lᵢ",       desc: "riesgo local de la comuna actual",             color: "text-emerald-300"},
            { code: "k",              math: "k = 1",     desc: "velocidad de respuesta al riesgo local",      color: "text-amber-300"  },
            { code: "derivative",     math: "k(Lᵢ−Rᵢ)", desc: "magnitud del cambio por km recorrido",        color: "text-amber-200"  },
            { code: "deltaKm",        math: "Δxᵢ",      desc: "longitud del segmento en kilómetros",         color: "text-amber-300"  },
            { code: "next",           math: "Rᵢ₊₁",     desc: "nuevo acumulado · entra al próximo segmento", color: "text-white"      },
          ].map(({ code, math, desc, color }) => (
            <div
              key={code}
              className="rounded-md border border-slate-800/60 bg-slate-900/30 px-3 py-2"
            >
              <div className="mb-0.5 flex items-center gap-2">
                <span className={`font-mono text-[10px] font-semibold ${color}`}>{code}</span>
                <span className="text-[9px] text-slate-700">≡</span>
                <span className={`font-mono text-[9px] opacity-65 ${color}`}>{math}</span>
              </div>
              <p className="text-[9px] leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full convergence simulation ────────────────────────────────────────── */}
      <div className={`mb-6 rounded-2xl border p-5 ${s.formulaBox}`}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Simulación · R converge hacia L en 6 pasos
          </p>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
            k = 1 · Δx ≈ 0.4 km
          </span>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <span className="w-8 shrink-0 text-right font-mono text-[10px] text-emerald-300">
            L
          </span>
          <div className="relative flex-1">
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-emerald-400/30" style={{ width: `${L_SIM}%` }} />
            </div>
            <div
              className="absolute top-0 h-full border-r-2 border-emerald-400/70"
              style={{ left: `${L_SIM}%` }}
            />
          </div>
          <span className="w-8 shrink-0 font-mono text-[10px] text-emerald-300 tabular-nums">
            {L_SIM}
          </span>
        </div>

        <div className="mb-3 h-px bg-slate-800/60" />

        {EULER_SIM.map(({ label, value, delay }) => (
          <div key={label} className="mb-2 flex items-center gap-3">
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-amber-300/80">
              {label}
            </span>
            <div className="flex-1 rounded-full bg-slate-800/80">
              <div
                className="ps-euler-bar h-1.5 rounded-full bg-amber-400/60"
                style={{ "--tw-bar-w": `${value}%`, animationDelay: delay } as React.CSSProperties}
              />
            </div>
            <span className="w-8 shrink-0 font-mono text-[10px] text-slate-500 tabular-nums">
              {value}
            </span>
          </div>
        ))}

        <p className="mt-3 text-[9px] font-mono text-slate-600">
          R se acerca a L pero nunca en saltos bruscos · clamp [0, 100]
        </p>
      </div>

      <div className="mb-5">
        <IOFlow data={data} s={s} />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Intuición
          </p>
          <p className="text-xs leading-relaxed text-slate-400">{data.intuition}</p>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Técnico
          </p>
          <p className="text-xs leading-relaxed text-slate-400">{data.technical}</p>
        </div>
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Hero: Evolution curve (step 08) ─────────────────────────────────────────

function EvolutionCurveSVG() {
  // Y axis: risk 0–100 mapped to svg y 72–8 (lower risk = higher y)
  const toY = (v: number) => 72 - v * 0.64;

  const rPoints: [number, number][] = [
    [20, toY(42)],
    [60, toY(56)],
    [100, toY(65)],
    [140, toY(70)],
    [180, toY(73)],
    [220, toY(75)],
  ];
  const lY = toY(78);
  const rPath = rPoints
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`)
    .join(" ");

  const gridValues = [0, 25, 50, 75, 100];

  return (
    <svg viewBox="0 0 240 90" className="w-full">
      {/* Grid */}
      {gridValues.map((v) => (
        <g key={v}>
          <line
            x1="20"
            y1={toY(v)}
            x2="225"
            y2={toY(v)}
            stroke="rgba(100,116,139,0.12)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
          <text
            x="17"
            y={toY(v) + 2.5}
            fontSize="5.5"
            fill="rgba(148,163,184,0.4)"
            textAnchor="end"
            fontFamily="monospace"
          >
            {v}
          </text>
        </g>
      ))}

      {/* L target line */}
      <line
        x1="20"
        y1={lY}
        x2="222"
        y2={lY}
        stroke="rgba(52,211,153,0.45)"
        strokeWidth="0.8"
        strokeDasharray="5,3"
      />
      <text
        x="225"
        y={lY + 2.5}
        fontSize="5.5"
        fill="rgba(52,211,153,0.7)"
        fontFamily="monospace"
      >
        L=78
      </text>

      {/* R curve */}
      <path
        d={rPath}
        fill="none"
        stroke="rgba(34,211,238,0.75)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shaded area under R curve */}
      <path d={`${rPath} L 220,76 L 20,76 Z`} fill="rgba(34,211,238,0.05)" />

      {/* Dots */}
      {rPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2.2"
          fill="rgb(34,211,238)"
          opacity="0.85"
        />
      ))}

      {/* Axis labels */}
      <text
        x="22"
        y={toY(42) - 4}
        fontSize="6"
        fill="rgba(34,211,238,0.65)"
        fontFamily="monospace"
      >
        R(0)=42
      </text>
      <text
        x="112"
        y="85"
        fontSize="5.5"
        fill="rgba(148,163,184,0.4)"
        textAnchor="middle"
        fontFamily="monospace"
      >
        distancia recorrida (x)
      </text>
    </svg>
  );
}

function CurveHeroCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-8 backdrop-blur-sm ${s.border} ${s.heroBg}`}
    >
      <div className="mb-6">
        <StepHeader data={data} s={s} />
      </div>

      {/* Curve visualization */}
      <div className={`mb-6 rounded-2xl border p-5 ${s.formulaBox}`}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            R(x) convergiendo hacia L a lo largo de la ruta
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[9px] text-cyan-400">
              <span className="inline-block h-px w-5 bg-cyan-400 opacity-75" />R
              acumulado
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400">
              <span className="inline-block h-px w-4 border-t border-dashed border-emerald-400 opacity-60" />
              L local
            </span>
          </div>
        </div>
        <EvolutionCurveSVG />
      </div>

      {/* Local vs Accumulated distinction */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/4 p-4">
          <p className="mb-1 font-mono text-[10px] font-semibold text-emerald-300">
            localRiskScore (L)
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            El riesgo de la comuna actual. Cambia abruptamente al cruzar
            fronteras de comunas. Describe el <em>ambiente</em>.
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/4 p-4">
          <p className="mb-1 font-mono text-[10px] font-semibold text-cyan-300">
            accumulatedRiskScore (R)
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            El historial de exposición acumulado hasta ese punto. Cambia
            suavemente con Euler. Describe la <em>historia</em>.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Intuición
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            {data.intuition}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Técnico
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            {data.technical}
          </p>
        </div>
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Results card (step 09) ───────────────────────────────────────────────────

function ResultsCard({ data, s }: { data: StepData; s: S }) {
  return (
    <article
      className={`rounded-2xl border bg-linear-to-br to-transparent p-6 backdrop-blur-sm ${s.border} ${s.gradient}`}
    >
      <div className="mb-4">
        <StepHeader data={data} s={s} />
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-400">
        {data.subtitle}
      </p>

      {/* Dashboard preview */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {/* Map column */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/4 p-3">
          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
            Mapa · ruta coloreada
          </p>
          <svg viewBox="0 0 160 55" className="w-full opacity-75">
            <path
              d="M 8,40 L 28,34 L 50,28 L 72,20 L 95,22 L 118,14 L 152,10"
              fill="none"
              stroke="transparent"
            />
            {[
              { d: "M 8,40 L 28,34 L 50,28", color: "rgba(52,211,153,0.8)" },
              { d: "M 50,28 L 72,20 L 95,22", color: "rgba(251,191,36,0.8)" },
              {
                d: "M 95,22 L 118,14 L 152,10",
                color: "rgba(248,113,113,0.8)",
              },
            ].map(({ d, color }, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            <circle cx="8" cy="40" r="2.5" fill="rgba(52,211,153,0.9)" />
            <circle cx="152" cy="10" r="2.5" fill="rgba(248,113,113,0.9)" />
          </svg>
          <div className="mt-2 flex gap-2">
            {[
              ["rgba(52,211,153,0.7)", "low"],
              ["rgba(251,191,36,0.7)", "medium"],
              ["rgba(248,113,113,0.7)", "high"],
            ].map(([color, label]) => (
              <span
                key={label}
                className="flex items-center gap-1 font-mono text-[9px] text-slate-500"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color as string }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Panel column */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/4 p-3">
          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
            Panel · segmento actual
          </p>
          <div className="space-y-2">
            {[
              {
                label: "Riesgo local (L)",
                value: "74",
                color: "text-amber-300",
              },
              {
                label: "Riesgo acum. (R)",
                value: "61",
                color: "text-cyan-300",
              },
              { label: "Nivel", value: "ALTO", color: "text-rose-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-slate-500">
                  {label}
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold ${color}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <IOFlow data={data} s={s} />
      </div>
      <div className="mb-4">
        <Explanations data={data} />
      </div>
      <WhyMatters data={data} s={s} />
    </article>
  );
}

// ─── Step card router ─────────────────────────────────────────────────────────

function renderStep(data: StepData, s: S): React.ReactNode {
  switch (data.variant) {
    case "equation-hero":
      return <EquationHeroCard key={data.step} data={data} s={s} />;
    case "euler-hero":
      return <EulerHeroCard key={data.step} data={data} s={s} />;
    case "curve-hero":
      return <CurveHeroCard key={data.step} data={data} s={s} />;
    default:
      if (data.phase === "cyan")
        return <GeometryCard key={data.step} data={data} s={s} />;
      if (data.phase === "emerald")
        return <GeographicCard key={data.step} data={data} s={s} />;
      if (data.phase === "violet")
        return <ResultsCard key={data.step} data={data} s={s} />;
      return <StandardCard key={data.step} data={data} s={s} />;
  }
}

// ─── Phase connector between steps ───────────────────────────────────────────

function StepConnector({ color }: { color: Phase }) {
  const s = PS[color];
  return (
    <div className="relative flex h-6 items-center justify-center">
      <div className={`absolute top-0 bottom-0 w-px ${s.line} opacity-50`} />
      <div
        className={`relative z-10 rounded-full border px-2 py-0.5 font-mono text-[8px] text-slate-600 ${s.badge} opacity-60`}
      >
        ↓
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function PipelineSteps() {
  return (
    <div className="mt-10 space-y-14">
      {PHASE_GROUPS.map(({ label, color, steps }) => {
        const s = PS[color];
        return (
          <div key={label}>
            {/* Phase divider */}
            <div className="mb-7 flex items-center gap-4">
              <div className={`h-px flex-1 ${s.line}`} />
              <span
                className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest ${s.badge}`}
              >
                {label}
              </span>
              <div className={`h-px flex-1 ${s.line}`} />
            </div>

            {/* Steps with connectors */}
            <div>
              {steps.map((step, i) => (
                <div key={step.step}>
                  {renderStep(step, s)}
                  {i < steps.length - 1 && <StepConnector color={color} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
