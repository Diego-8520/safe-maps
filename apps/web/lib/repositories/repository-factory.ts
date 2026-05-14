import { getSafeMapsDataSource } from "@/lib/supabase/config";
import type { CommuneRepository } from "./commune-repository";
import type { CommuneRiskRepository } from "./commune-risk-repository";
import { localCommuneRepository } from "./local-commune-repository";
import { localCommuneRiskRepository } from "./local-commune-risk-repository";
import { supabaseCommuneRepository } from "./supabase-commune-repository";
import { supabaseCommuneRiskRepository } from "./supabase-commune-risk-repository";

export function getCommuneRepository(): CommuneRepository {
  return getSafeMapsDataSource() === "supabase"
    ? supabaseCommuneRepository
    : localCommuneRepository;
}

export function getCommuneRiskRepository(): CommuneRiskRepository {
  return getSafeMapsDataSource() === "supabase"
    ? supabaseCommuneRiskRepository
    : localCommuneRiskRepository;
}
