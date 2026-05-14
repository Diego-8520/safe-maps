import type { CommuneRiskData, EnrichedFeatureProperties } from "@/components/map/types";
import { isRiskLevel } from "@/components/map/risk-utils";

const RISK_FALLBACK: Omit<CommuneRiskData, "comuna"> = {
  riskScore: 0,
  riskLevel: "low",
  criminalidad: 0,
  seguridad: 0,
  vigilancia: 0,
  iluminacion: 0,
  flujoPersonas: 0,
};

export async function loadEnrichedGeojson(): Promise<GeoJSON.FeatureCollection> {
  const [geojsonRes, riskRes] = await Promise.all([
    fetch("/data/comunas-cali.geojson"),
    fetch("/api/communes/risk"),
  ]);

  if (!geojsonRes.ok) throw new Error(`GeoJSON fetch failed: ${geojsonRes.status}`);
  if (!riskRes.ok) throw new Error(`Risk data fetch failed: ${riskRes.status}`);

  const geojson = (await geojsonRes.json()) as GeoJSON.FeatureCollection;
  const riskList = (await riskRes.json()) as CommuneRiskData[];

  const riskMap = new Map<number, CommuneRiskData>(
    riskList.map((r) => [r.comuna, r])
  );

  return {
    ...geojson,
    features: geojson.features.map((feature) => {
      const props = feature.properties as {
        comuna: number;
        nombre: string;
        shape_leng?: number;
        shape_area?: number;
      };
      const risk = riskMap.get(props.comuna) ?? { comuna: props.comuna, ...RISK_FALLBACK };
      return { ...feature, properties: { ...props, ...risk } satisfies EnrichedFeatureProperties };
    }),
  };
}

export function normalizeCommuneProperties(raw: Partial<EnrichedFeatureProperties>): EnrichedFeatureProperties {
  const level = isRiskLevel(raw.riskLevel) ? raw.riskLevel : "low";
  return {
    comuna:        raw.comuna        ?? 0,
    nombre:        raw.nombre        ?? "Comuna",
    shape_leng:    raw.shape_leng,
    shape_area:    raw.shape_area,
    riskScore:     raw.riskScore     ?? 0,
    riskLevel:     level,
    criminalidad:  raw.criminalidad  ?? 0,
    seguridad:     raw.seguridad     ?? 0,
    vigilancia:    raw.vigilancia    ?? 0,
    iluminacion:   raw.iluminacion   ?? 0,
    flujoPersonas: raw.flujoPersonas ?? 0,
  };
}
