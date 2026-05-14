import type { Database } from "@/lib/supabase/types";
import type { CommuneRisk } from "@/lib/types/commune-risk";
import type { RouteRiskLevel } from "@/lib/types/risk";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommuneRiskRepository } from "./commune-risk-repository";

type CommuneRiskProfileRow =
  Database["public"]["Tables"]["commune_risk_profiles"]["Row"];
type CommuneRow = Database["public"]["Tables"]["communes"]["Row"];

interface SupabaseCommuneRiskRow
  extends Pick<
    CommuneRiskProfileRow,
    | "criminalidad"
    | "seguridad"
    | "vigilancia"
    | "iluminacion"
    | "flujo_personas"
    | "risk_score"
    | "risk_level"
  > {
  communes: Pick<CommuneRow, "comuna_numero" | "zona_id">;
}

function toRouteRiskLevel(value: string): RouteRiskLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  throw new Error(`Unsupported Supabase risk_level value: ${value}`);
}

function toCommuneRisk(row: SupabaseCommuneRiskRow): CommuneRisk {
  return {
    comuna: row.communes.comuna_numero,
    riskScore: row.risk_score,
    riskLevel: toRouteRiskLevel(row.risk_level),
    criminalidad: row.criminalidad,
    seguridad: row.seguridad,
    vigilancia: row.vigilancia,
    iluminacion: row.iluminacion,
    flujoPersonas: row.flujo_personas,
  };
}

export class SupabaseCommuneRiskRepository implements CommuneRiskRepository {
  async getAll(): Promise<CommuneRisk[]> {
    const rows = await createSupabaseServerClient().get<SupabaseCommuneRiskRow>(
      "commune_risk_profiles",
      {
        select:
          "criminalidad,seguridad,vigilancia,iluminacion,flujo_personas,risk_score,risk_level,communes!inner(comuna_numero,zona_id)",
      },
    );

    return rows
      .map(toCommuneRisk)
      .sort((a, b) => a.comuna - b.comuna);
  }
}

export const supabaseCommuneRiskRepository: CommuneRiskRepository =
  new SupabaseCommuneRiskRepository();
