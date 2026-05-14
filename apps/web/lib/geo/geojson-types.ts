export type GeoJsonPosition = [number, number]; // [lng, lat]
export type GeoJsonRing = GeoJsonPosition[];

export interface GeoJsonPolygonGeometry {
  type: "Polygon";
  coordinates: GeoJsonRing[]; // [exterior, ...holes]
}

export interface GeoJsonMultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: GeoJsonRing[][]; // each element is one polygon's rings [exterior, ...holes]
}

export type CommuneGeometry = GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry;

export interface CommuneProperties {
  comuna?: unknown;
  COMUNA?: unknown;
  id?: unknown;
  ID?: unknown;
  codigo?: unknown;
  CODIGO?: unknown;
  nombre?: unknown;
  NOMBRE?: unknown;
  [key: string]: unknown;
}

export interface CommuneFeature {
  type: "Feature";
  properties: CommuneProperties;
  geometry: CommuneGeometry;
}

export interface CommunesGeoJSON {
  type: "FeatureCollection";
  features: CommuneFeature[];
}
