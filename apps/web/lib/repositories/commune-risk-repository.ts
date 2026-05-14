import type { CommuneRisk } from "@/lib/types/commune-risk";

export interface CommuneRiskRepository {
  getAll(): Promise<CommuneRisk[]>;
}
