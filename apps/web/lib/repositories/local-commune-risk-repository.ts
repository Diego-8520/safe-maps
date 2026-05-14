import type { CommuneRisk } from "@/lib/types/commune-risk";
import { loadCommunesRisk } from "@/lib/risk/load-communes-risk";
import type { CommuneRiskRepository } from "./commune-risk-repository";

class LocalCommuneRiskRepository implements CommuneRiskRepository {
  async getAll(): Promise<CommuneRisk[]> {
    return loadCommunesRisk();
  }
}

export const localCommuneRiskRepository: CommuneRiskRepository =
  new LocalCommuneRiskRepository();
