import type { CommuneFeature } from "@/lib/geo/geojson-types";

export interface CommuneRepository {
  getFeatures(): Promise<CommuneFeature[]>;
}
