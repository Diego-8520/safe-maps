import { getCommuneRepository, getCommuneRiskRepository } from "@/lib/repositories/repository-factory";
import { getSafeMapsDataSource } from "@/lib/supabase/config";

interface HealthResponse {
  dataSource: string;
  communes: number | null;
  riskProfiles: number | null;
  status: "ok" | "error";
  message?: string;
}

export async function GET(): Promise<Response> {
  try {
    const dataSource = getSafeMapsDataSource();
    let communes = 0;
    let riskProfiles = 0;

    try {
      const communeFeatures = await getCommuneRepository().getFeatures();
      communes = communeFeatures.length;
    } catch {
      communes = 0;
    }

    try {
      const riskData = await getCommuneRiskRepository().getAll();
      riskProfiles = riskData.length;
    } catch {
      riskProfiles = 0;
    }

    const response: HealthResponse = {
      dataSource,
      communes,
      riskProfiles,
      status: communes > 0 && riskProfiles > 0 ? "ok" : "error",
    };

    if (communes === 0 || riskProfiles === 0) {
      response.message = `Missing data: communes=${communes}, riskProfiles=${riskProfiles}`;
    }

    return Response.json(response, {
      status: response.status === "ok" ? 200 : 503,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        dataSource: "unknown",
        communes: null,
        riskProfiles: null,
        status: "error",
        message,
      } as HealthResponse,
      { status: 500 },
    );
  }
}
