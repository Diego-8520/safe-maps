export interface GeocodedLocation {
  label: string;
  coordinates: [number, number]; // [lon, lat]
}

export interface OrsGeocodeFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    label: string;
    country?: string;
    region?: string;
    locality?: string;
    confidence?: number;
  };
}

export interface OrsGeocodeResponse {
  type: "FeatureCollection";
  features: OrsGeocodeFeature[];
}

export interface OrsDirectionsStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
}

export interface OrsDirectionsSegment {
  distance: number;
  duration: number;
  steps: OrsDirectionsStep[];
}

export interface OrsDirectionsProperties {
  summary: {
    distance: number;
    duration: number;
  };
  segments: OrsDirectionsSegment[];
  way_points: [number, number];
}

export interface OrsDirectionsFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lon, lat][]
  };
  properties: OrsDirectionsProperties;
}

export interface OrsDirectionsResponse {
  type: "FeatureCollection";
  features: OrsDirectionsFeature[];
  bbox: number[];
}
