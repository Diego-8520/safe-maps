import type { EnrichedFeatureProperties } from "@/components/map/types";

// --- getDominantRiskFactor ---

type RiskFactor = {
  label: string;
  value: number;
  description: string;
};

type FactorEntry = {
  label: string;
  score: number;
  description: string;
};

function buildFactors(c: EnrichedFeatureProperties): FactorEntry[] {
  return [
    {
      label: "Criminalidad",
      score: c.criminalidad,
      description: "Alta criminalidad reportada en el área urbana.",
    },
    {
      label: "Seguridad ciudadana",
      score: 100 - c.seguridad,
      description: "Baja percepción de seguridad ciudadana en la zona.",
    },
    {
      label: "Vigilancia",
      score: 100 - c.vigilancia,
      description: "Déficit de cobertura de vigilancia urbana.",
    },
    {
      label: "Iluminación",
      score: 100 - c.iluminacion,
      description: "Iluminación insuficiente en vías y espacios públicos.",
    },
    {
      label: "Flujo peatonal",
      score: Math.max(0, 60 - c.flujoPersonas),
      description: "Bajo flujo peatonal que reduce la percepción de seguridad.",
    },
  ];
}

export function getDominantRiskFactor(commune: EnrichedFeatureProperties): RiskFactor {
  const factors = buildFactors(commune);
  const dominant = factors.reduce((max, f) => (f.score > max.score ? f : max), factors[0]);
  return {
    label: dominant.label,
    value: Math.round(dominant.score),
    description: dominant.description,
  };
}

// --- getCommuneRiskInterpretation ---

type RiskInterpretation = {
  title: string;
  description: string;
};

export function getCommuneRiskInterpretation(commune: EnrichedFeatureProperties): RiskInterpretation {
  const name = commune.nombre;
  switch (commune.riskLevel) {
    case "low":
      return {
        title: "Zona de riesgo bajo",
        description: `Los indicadores simulados de ${name} muestran condiciones urbanas favorables. Seguridad, vigilancia e iluminación presentan valores altos dentro del modelo académico actual.`,
      };
    case "medium":
      return {
        title: "Zona de riesgo moderado",
        description: `${name} presenta una combinación mixta de indicadores en este modelo simulado. Algunas variables muestran déficits que elevan el riesgo por encima del umbral bajo según el análisis actual.`,
      };
    case "high":
      return {
        title: "Zona de riesgo alto",
        description: `Los indicadores simulados de ${name} reflejan condiciones que el modelo actual clasifica como de alto riesgo. Esta clasificación es provisional y pertenece exclusivamente al modelo de desarrollo académico.`,
      };
  }
}

// --- getCommuneAcademicNote ---

export function getCommuneAcademicNote(commune: EnrichedFeatureProperties): string {
  const impact =
    commune.riskLevel === "high"
      ? "un incremento significativo"
      : commune.riskLevel === "medium"
        ? "un aporte moderado"
        : "un impacto reducido";

  return (
    `En el modelo diferencial futuro, los segmentos de ruta que atraviesen ${commune.nombre} ` +
    `modificarán el riesgo acumulado R(x) según sus variables urbanas normalizadas. ` +
    `Con un puntaje de ${commune.riskScore}/100, esta comuna representa ${impact} ` +
    `en la función de riesgo diferencial.`
  );
}

// --- getRiskBalance ---

type RiskBalance = {
  positiveFactors: string[];
  negativeFactors: string[];
};

export function getRiskBalance(commune: EnrichedFeatureProperties): RiskBalance {
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  if (commune.seguridad >= 70)    positiveFactors.push("Seguridad alta");
  if (commune.vigilancia >= 70)   positiveFactors.push("Vigilancia adecuada");
  if (commune.iluminacion >= 70)  positiveFactors.push("Iluminación adecuada");
  if (commune.flujoPersonas >= 60) positiveFactors.push("Flujo peatonal activo");

  if (commune.criminalidad >= 70) negativeFactors.push("Alta criminalidad");
  if (commune.seguridad <= 40)    negativeFactors.push("Seguridad baja");
  if (commune.vigilancia <= 40)   negativeFactors.push("Vigilancia insuficiente");
  if (commune.iluminacion <= 40)  negativeFactors.push("Iluminación deficiente");
  if (commune.flujoPersonas <= 30) negativeFactors.push("Flujo peatonal bajo");

  return { positiveFactors, negativeFactors };
}
