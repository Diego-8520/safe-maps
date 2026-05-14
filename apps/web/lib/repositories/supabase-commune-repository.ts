import type {
  CommuneFeature,
  CommuneGeometry,
  CommuneProperties,
} from "@/lib/geo/geojson-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { CommuneRepository } from "./commune-repository";

type CommuneRow = Database["public"]["Tables"]["communes"]["Row"];
type SupabaseCommuneRow = Pick<
  CommuneRow,
  "comuna_numero" | "zona_id" | "name" | "geometry"
>;

function isPosition(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function isRing(value: unknown): value is [number, number][] {
  return Array.isArray(value) && value.every(isPosition);
}

function isPolygonCoordinates(value: unknown): value is [number, number][][] {
  return Array.isArray(value) && value.every(isRing);
}

function isMultiPolygonCoordinates(value: unknown): value is [number, number][][][] {
  return Array.isArray(value) && value.every(isPolygonCoordinates);
}

function isCommuneGeometry(value: unknown): value is CommuneGeometry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const geometry = value as { type?: unknown; coordinates?: unknown };

  if (geometry.type === "Polygon") {
    return isPolygonCoordinates(geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return isMultiPolygonCoordinates(geometry.coordinates);
  }

  return false;
}

function parseGeometry(row: SupabaseCommuneRow): CommuneGeometry {
  const raw = row.geometry;
  const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!isCommuneGeometry(candidate)) {
    throw new Error(
      `Supabase commune ${row.comuna_numero} returned geometry in an unsupported format. Add a PostGIS ST_AsGeoJSON view/RPC before enabling the Supabase data source.`,
    );
  }

  return candidate;
}

function toFeature(row: SupabaseCommuneRow): CommuneFeature {
  const properties: CommuneProperties = {
    comuna: row.comuna_numero,
    COMUNA: row.comuna_numero,
    id: row.zona_id,
    ID: row.zona_id,
    codigo: row.zona_id,
    CODIGO: row.zona_id,
    nombre: row.name,
    NOMBRE: row.name,
  };

  return {
    type: "Feature",
    properties,
    geometry: parseGeometry(row),
  };
}

export class SupabaseCommuneRepository implements CommuneRepository {
  async getFeatures(): Promise<CommuneFeature[]> {
    const rows = await createSupabaseServerClient().get<SupabaseCommuneRow>(
      "communes",
      {
        select: "comuna_numero,zona_id,name,geometry",
        order: "comuna_numero.asc",
      },
    );

    return rows.map(toFeature);
  }
}

export const supabaseCommuneRepository: CommuneRepository =
  new SupabaseCommuneRepository();
