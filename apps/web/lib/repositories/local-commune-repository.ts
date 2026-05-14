import type { CommuneFeature } from "@/lib/geo/geojson-types";
import { loadCommunesGeoJSON } from "@/lib/geo/load-communes-geojson";
import type { CommuneRepository } from "./commune-repository";

class LocalCommuneRepository implements CommuneRepository {
  async getFeatures(): Promise<CommuneFeature[]> {
    const geoJSON = await loadCommunesGeoJSON();
    return geoJSON.features;
  }
}

export const localCommuneRepository: CommuneRepository =
  new LocalCommuneRepository();
