import type {
  CommuneFeature,
  CommuneGeometry,
  CommuneProperties,
} from "@/lib/geo/geojson-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { CommuneRepository } from "./commune-repository";

type CommuneGeoJsonRow =
  Database["public"]["Views"]["communes_geojson"]["Row"];
type SupabaseCommuneRow = Pick<
  CommuneGeoJsonRow,
  "comuna_numero" | "zona_id" | "name" | "geometry_geojson"
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
  const raw = row.geometry_geojson;
  const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!isCommuneGeometry(candidate)) {
    throw new Error(
      `Supabase communes_geojson row ${row.comuna_numero ?? "unknown"} returned geometry_geojson in an unsupported format.`,
    );
  }

  return candidate;
}

function requireField<T>(
  value: T | null,
  field: string,
  row: SupabaseCommuneRow,
): T {
  if (value === null) {
    throw new Error(
      `Supabase communes_geojson row is missing required field ${field} for comuna ${row.comuna_numero ?? "unknown"}.`,
    );
  }

  return value;
}

function toFeature(row: SupabaseCommuneRow): CommuneFeature {
  const comunaNumero = requireField(row.comuna_numero, "comuna_numero", row);
  const zonaId = requireField(row.zona_id, "zona_id", row);
  const name = requireField(row.name, "name", row);
  const properties: CommuneProperties = {
    comuna: comunaNumero,
    COMUNA: comunaNumero,
    id: zonaId,
    ID: zonaId,
    codigo: zonaId,
    CODIGO: zonaId,
    nombre: name,
    NOMBRE: name,
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
      "communes_geojson",
      {
        select: "comuna_numero,zona_id,name,geometry_geojson",
        order: "comuna_numero.asc",
      },
    );

    return rows.map(toFeature);
  }
}

export const supabaseCommuneRepository: CommuneRepository =
  new SupabaseCommuneRepository();
