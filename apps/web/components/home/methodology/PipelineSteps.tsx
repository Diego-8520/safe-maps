type Phase = "cyan" | "emerald" | "amber" | "violet";

type StepData = {
  step: string;
  phase: Phase;
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

type Styles = {
  accent: string;
  border: string;
  gradient: string;
  dot: string;
  badge: string;
  io: string;
  formula: string;
  why: string;
  line: string;
};

const PHASE_STYLES: Record<Phase, Styles> = {
  cyan: {
    accent: "text-cyan-400",
    border: "border-cyan-500/25",
    gradient: "from-cyan-500/[0.04]",
    dot: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    io: "border-cyan-500/20 bg-cyan-500/[0.04]",
    formula: "border-cyan-500/20 bg-cyan-500/[0.03]",
    why: "border-l-cyan-500/50",
    line: "bg-cyan-500/20",
  },
  emerald: {
    accent: "text-emerald-400",
    border: "border-emerald-500/25",
    gradient: "from-emerald-500/[0.04]",
    dot: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    io: "border-emerald-500/20 bg-emerald-500/[0.04]",
    formula: "border-emerald-500/20 bg-emerald-500/[0.03]",
    why: "border-l-emerald-500/50",
    line: "bg-emerald-500/20",
  },
  amber: {
    accent: "text-amber-400",
    border: "border-amber-500/25",
    gradient: "from-amber-500/[0.04]",
    dot: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    io: "border-amber-500/20 bg-amber-500/[0.04]",
    formula: "border-amber-500/20 bg-amber-500/[0.03]",
    why: "border-l-amber-500/50",
    line: "bg-amber-500/20",
  },
  violet: {
    accent: "text-violet-400",
    border: "border-violet-500/25",
    gradient: "from-violet-500/[0.04]",
    dot: "border-violet-500/50 bg-violet-500/10 text-violet-400",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    io: "border-violet-500/20 bg-violet-500/[0.04]",
    formula: "border-violet-500/20 bg-violet-500/[0.03]",
    why: "border-l-violet-500/50",
    line: "bg-violet-500/20",
  },
};

const STEPS: StepData[] = [
  {
    step: "01",
    phase: "cyan",
    title: "Ruta real desde OpenRouteService",
    subtitle: "El sistema no dibuja una línea recta. Pide el camino exacto por las calles.",
    intuition:
      "Cuando buscas una ruta en el mapa, el sistema no asume que vas en línea recta. Pide a un servicio externo el trayecto real que seguirías por la red vial: giros, calles y distancias incluidos. Eso le da una geometría honesta sobre la que trabajar.",
    technical:
      "OpenRouteService retorna un GeoJSON con una LineString. El backend normaliza la respuesta extrayendo la secuencia ordenada de coordenadas [lng, lat] que describe la traza real de la vía y la distancia total del recorrido.",
    inputs: ["coordenada de origen (lng, lat)", "coordenada de destino (lng, lat)"],
    process: "POST /directions → OpenRouteService → GeoJSON LineString",
    outputs: ["polyline: secuencia de N coordenadas reales", "distancia total en metros"],
    whyMatters:
      "Sin geometría real de la vía, los segmentos no tendrían posición geográfica válida. El cruce con comunas, el riesgo local y la integración de Euler dependen de que las coordenadas correspondan a calles reales.",
    reference: "normalizeOpenRouteResponse()",
  },
  {
    step: "02",
    phase: "cyan",
    title: "División en segmentos continuos de ~400 m",
    subtitle: "La ruta completa se corta en tramos pequeños. Cada tramo tendrá su propio riesgo.",
    intuition:
      "Si la ruta tiene 5 km, el sistema no la analiza como un bloque. La divide en pedazos de ~400 m, como leer una frase palabra por palabra en vez de todo de golpe. Así puede estudiar qué zona de la ciudad atraviesa cada trozo por separado.",
    technical:
      "La polyline se recorre acumulando distancia haversine entre coordenadas consecutivas. Cuando el acumulado supera TARGET_SEGMENT_METERS (400 m), se cierra el tramo actual y comienza uno nuevo. Cada segmento almacena coordenadas de inicio, fin, punto medio y su longitud en kilómetros (deltaKm).",
    inputs: ["polyline con N coordenadas", "TARGET_SEGMENT_METERS = 400"],
    process: "acumular distancia haversine → corte cada 400 m → nuevo segmento",
    outputs: [
      "array RouteSegment[] con ≈ distanciaTotal / 400 elementos",
      "cada segmento: coordenadas + punto medio + deltaKm",
    ],
    whyMatters:
      "Euler necesita pasos discretos con longitud medible. Sin deltaKm no existe la variable Δx de la integral numérica. Sin segmentos, el modelo no puede avanzar paso a paso.",
    reference: "segmentByDistance()",
  },
  {
    step: "03",
    phase: "emerald",
    title: "Cada segmento encuentra su comuna",
    subtitle: "El punto medio de cada tramo se cruza con los polígonos de las 22 comunas.",
    intuition:
      "Cada tramo de la ruta vive dentro de alguna zona de la ciudad. Para saberlo, el sistema calcula el punto exacto del centro del tramo y pregunta: ¿dentro de qué polígono de comuna cae este punto? La respuesta le da identidad geográfica al segmento.",
    technical:
      "Para cada segmento se computa el punto medio de sus coordenadas. Ese punto se evalúa contra los polígonos GeoJSON de las comunas usando point-in-polygon. El segmento hereda el communeId del polígono que lo contiene. Si el punto cae fuera de todos los polígonos, el segmento queda sin comuna asignada.",
    inputs: ["array RouteSegment[] con punto medio", "polígonos GeoJSON de 22 comunas de Cali"],
    process: "punto medio → point-in-polygon sobre 22 polígonos → communeId",
    outputs: ["cada RouteSegment + communeId asignado"],
    whyMatters:
      "Sin communeId, el sistema no sabe de dónde obtener el riesgo local. El segmento necesita identidad geográfica antes de poder consultar Supabase. Sin este cruce, L no existe.",
    reference: "findCommuneForPoint()",
  },
  {
    step: "04",
    phase: "emerald",
    title: "Riesgo local L desde Supabase",
    subtitle: "Supabase entrega el risk_score de la comuna. Ese número se convierte en L.",
    intuition:
      "La base de datos tiene un número entre 0 y 100 para cada zona de Cali. Ese número resume la exposición relativa al riesgo urbano de esa zona, calculada a partir de indicadores históricos. El sistema lo toma y se lo asigna al segmento como su 'nivel de ambiente'.",
    technical:
      "El repositorio consulta commune_risk_profiles en Supabase filtrando por communeId. El campo risk_score, normalizado entre 0 y 100, se asigna al segmento como localRiskScore. Este valor es exactamente L en la ecuación diferencial dR/dx = k(L − R).",
    inputs: ["communeId de cada segmento", "tabla commune_risk_profiles en Supabase"],
    process: "SELECT risk_score FROM commune_risk_profiles WHERE commune_id = communeId",
    outputs: ["localRiskScore ∈ [0, 100] por segmento", "L listo para la ecuación diferencial"],
    whyMatters:
      "L es la fuerza de atracción del modelo. Sin risk_score, la ecuación no tiene objetivo hacia dónde converger. El riesgo acumulado no podría evolucionar: simplemente no cambiaría.",
    reference: "commune_risk_profiles.risk_score",
  },
  {
    step: "05",
    phase: "amber",
    title: "Condición inicial R(0)",
    subtitle: "El integrador no empieza desde cero. Arranca con el riesgo real del punto de origen.",
    intuition:
      "Antes de empezar a caminar, ya estás en algún lugar de la ciudad con un nivel de riesgo propio. El modelo no ignora eso: toma el riesgo de la primera zona que pisas y lo usa como punto de partida. Así el resultado es coherente desde el primer metro.",
    technical:
      "R(0) se inicializa con el localRiskScore del primer segmento de la ruta. Esto garantiza continuidad matemática: la condición inicial no es arbitraria sino un dato real del ambiente de partida. Sin esta inicialización, Euler no tiene de dónde arrancar.",
    inputs: ["localRiskScore del primer segmento (índice 0)"],
    process: "R(0) ← segments[0].localRiskScore",
    outputs: ["initialRiskScore = R(0)", "punto de partida del integrador numérico"],
    formula: "R(0) = localRiskScore[0]",
    formulaNote:
      "Iniciar con R(0) = 0 sería arbitrario y distorsionaría el resultado: la curva arrancaría desde un piso falso en lugar del ambiente real.",
    whyMatters:
      "La condición inicial ancla el modelo a la realidad. Un origen en una zona de riesgo alto debe reflejarse desde el primer tramo, no aparecer de la nada varios segmentos después.",
    reference: "initialRiskScore",
  },
  {
    step: "06",
    phase: "amber",
    title: "La ecuación diferencial dR/dx = k(L − R)",
    subtitle: "El riesgo acumulado es atraído hacia el riesgo local. Nunca cambia de golpe.",
    intuition:
      "Si la zona que estás cruzando es más peligrosa que lo vivido hasta ahora, tu exposición sube lentamente hacia ese nivel. Si es más tranquila, baja poco a poco. La ecuación captura esa lógica: el acumulado siempre se mueve hacia el nivel local, nunca de forma abrupta.",
    technical:
      "La ODE modela atracción proporcional a la diferencia entre el riesgo local L y el acumulado R. Con k = 1 (euler-v1), por cada kilómetro recorrido R avanza un porcentaje de la brecha (L − R). La derivada describe la dirección y magnitud del cambio respecto a la distancia x.",
    inputs: [
      "R: riesgo acumulado actual",
      "L: riesgo local del segmento (localRiskScore)",
      "k = 1 (constante euler-v1)",
    ],
    process: "derivative = k × (L − R)",
    outputs: ["tasa de cambio dR/dx", "dirección y magnitud del ajuste por kilómetro"],
    formula: "dR/dx = k(L − R)",
    formulaNote:
      "L > R → dR/dx > 0 → R sube hacia L   ·   L < R → dR/dx < 0 → R baja hacia L   ·   L = R → dR/dx = 0 → R estable",
    whyMatters:
      "Sin esta ecuación el riesgo acumulado cambiaría abruptamente al cruzar fronteras de comunas. La ODE produce una curva suave que modela exposición progresiva, no teletransportación entre niveles.",
    reference: "dR/dx = k(L − R)",
  },
  {
    step: "07",
    phase: "amber",
    title: "Método de Euler: la ODE en pasos discretos",
    subtitle: "Euler convierte la ecuación continua en una operación aplicable segmento a segmento.",
    intuition:
      "No existe una fórmula mágica que resuelva dR/dx = k(L−R) sobre una ruta irregular con longitudes variables. En cambio, Euler avanza un pasito a la vez: calcula cuánto cambia R en este tramo específico, aplica ese cambio y pasa al siguiente tramo con el nuevo valor. Es como sumar pasos pequeños en lugar de intentar resolver el camino completo de una sola vez.",
    technical:
      "El método de Euler forward aplica R(x + Δx) ≈ R(x) + f(R, x) · Δx, donde f(R, x) = k · (L − R) y Δx = deltaKm del segmento actual. El resultado se limita al rango [0, 100] con clamp para conservar la escala normalizada del sistema.",
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
      "Δx = deltaKm. Tramos largos producen ajustes mayores. Tramos cortos cambian R poco, suavizando la curva. El clamp evita que R salga del rango semántico del sistema.",
    whyMatters:
      "Sin Euler no hay forma de integrar la ODE sobre segmentos de longitud variable. La aproximación numérica es lo que permite resolver el modelo sobre una ruta real con geometría irregular.",
    reference: "calculateEulerRiskEvolution()",
  },
  {
    step: "08",
    phase: "amber",
    title: "Evolución acumulada a lo largo de toda la ruta",
    subtitle: "Cada segmento guarda dos valores distintos: el riesgo de su zona y su historia acumulada.",
    intuition:
      "Euler no produce un solo número. Produce una historia: cómo fue cambiando tu exposición al riesgo a medida que avanzabas. El segmento 1 tiene su valor, el 2 tiene el suyo actualizado, y así hasta el final. Al llegar, puedes ver exactamente en qué tramo subió y en cuál bajó.",
    technical:
      "El output de cada paso Euler se convierte en el input del siguiente. Así se construye la serie temporal de R a lo largo de x. Cada RouteSegment almacena simultáneamente localRiskScore (el riesgo de la comuna, L) y accumulatedRiskScore (el resultado Euler hasta ese punto, R). Son dos magnitudes distintas con significados diferentes.",
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
      "La distinción entre riesgo local y acumulado es el corazón del modelo. El local describe el ambiente puntual; el acumulado describe cuánto riesgo se ha integrado durante el trayecto completo. Confundirlos eliminaría la utilidad del integrador.",
    reference: "accumulatedRiskScore",
  },
  {
    step: "09",
    phase: "violet",
    title: "Visualización en mapa y paneles de análisis",
    subtitle: "Los números se convierten en colores, gráficas y detalle por segmento consultable.",
    intuition:
      "Todo el procesamiento anterior produce segmentos llenos de datos. La interfaz los convierte en algo que cualquier persona puede leer: el mapa colorea cada tramo según su nivel de riesgo, y el panel lateral muestra cómo evolucionó el acumulado a lo largo del recorrido.",
    technical:
      "El frontend recibe RouteAnalysis.segments con localRiskScore, accumulatedRiskScore y riskLevel por tramo. MapLibre renderiza la ruta coloreando cada segmento con su level. El panel lateral pagina los segmentos y muestra la evolución numérica de R. El usuario puede navegar tramo a tramo y ver los valores exactos.",
    inputs: [
      "RouteAnalysis.segments[]",
      "localRiskScore + accumulatedRiskScore + riskLevel por segmento",
    ],
    process: "segmentos → capas GeoJSON en MapLibre + panel lateral paginado",
    outputs: [
      "ruta coloreada por riskLevel en el mapa (low / medium / high)",
      "panel con evolución de R a lo largo de x",
      "detalle numérico por segmento consultable",
    ],
    whyMatters:
      "Sin visualización, el modelo es un número en memoria. La UI convierte el resultado numérico en información comprensible: el usuario puede ver dónde aumenta su exposición y cómo evoluciona durante el recorrido.",
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
  {
    label: "Fase IV · Resultados",
    color: "violet",
    steps: [STEPS[8]],
  },
];

function StepCard({ data, s }: { data: StepData; s: Styles }) {
  return (
    <article
      className={`rounded-2xl border bg-gradient-to-br to-transparent p-6 backdrop-blur-sm ${s.border} ${s.gradient}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${s.dot}`}
          >
            {data.step}
          </span>
          <div>
            <p className={`mb-0.5 text-[10px] font-mono uppercase tracking-widest ${s.accent}`}>
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

      <p className="mb-5 text-sm leading-relaxed text-slate-400">{data.subtitle}</p>

      {/* IO Flow */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {/* Inputs */}
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

        <div className={`flex items-center justify-center py-1 text-sm sm:px-1 ${s.accent} opacity-50`}>
          →
        </div>

        {/* Process */}
        <div className="flex-[1.2] rounded-xl border border-slate-700/40 bg-slate-900/50 p-3">
          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            Proceso
          </p>
          <p className="font-mono text-[10px] leading-relaxed text-slate-300">{data.process}</p>
        </div>

        <div className={`flex items-center justify-center py-1 text-sm sm:px-1 ${s.accent} opacity-50`}>
          →
        </div>

        {/* Outputs */}
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

      {/* Intuition + Technical */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
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

      {/* Formula (optional) */}
      {data.formula && (
        <div className={`mb-4 rounded-xl border p-4 text-center ${s.formula}`}>
          <p className={`font-mono text-xl font-semibold tracking-wide ${s.accent}`}>
            {data.formula}
          </p>
          {data.formulaNote && (
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{data.formulaNote}</p>
          )}
        </div>
      )}

      {/* Why matters */}
      <div className={`border-l-2 pl-3 ${s.why}`}>
        <p className="mb-0.5 text-[9px] font-mono uppercase tracking-widest text-slate-600">
          Por qué importa
        </p>
        <p className="text-xs leading-relaxed text-slate-500">{data.whyMatters}</p>
      </div>
    </article>
  );
}

export function PipelineSteps() {
  return (
    <div className="mt-10 space-y-14">
      {PHASE_GROUPS.map(({ label, color, steps }) => {
        const s = PHASE_STYLES[color];
        return (
          <div key={label}>
            {/* Phase divider */}
            <div className="mb-6 flex items-center gap-4">
              <div className={`h-px flex-1 ${s.line}`} />
              <span
                className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest ${s.badge}`}
              >
                {label}
              </span>
              <div className={`h-px flex-1 ${s.line}`} />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step) => (
                <StepCard key={step.step} data={step} s={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
