import type { GeocodedLocation, OrsGeocodeResponse, OrsDirectionsResponse } from "./openroute-types";
import {
  OrsApiKeyMissingError,
  OrsGeocodingError,
  OrsRoutingError,
  OrsNetworkError,
} from "./openroute-errors";

const ORS_BASE_URL = "https://api.openrouteservice.org";

// Approximate center of Cali, Colombia — used to bias geocoding results.
const CALI_CENTER = { lon: -76.532, lat: 3.4516 };

function getApiKey(): string {
  const key = process.env.OPENROUTE_API_KEY;
  if (!key) throw new OrsApiKeyMissingError();
  return key;
}

function enrichAddress(address: string): string {
  const lower = address.toLowerCase();

  // Normalize known ambiguous campus queries that geocode incorrectly without a full address.
  if (lower.includes("universidad del valle") || lower.includes("univalle")) {
    return "Universidad del Valle, Calle 13 #100-00, Cali, Colombia";
  }

  if (lower.includes("colombia")) return address;
  if (lower.includes("cali")) return `${address}, Colombia`;
  return `${address}, Cali, Colombia`;
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  const apiKey = getApiKey();
  const enriched = enrichAddress(address);

  const params = new URLSearchParams({
    api_key: apiKey,
    text: enriched,
    "boundary.country": "CO",
    "focus.point.lon": String(CALI_CENTER.lon),
    "focus.point.lat": String(CALI_CENTER.lat),
    size: "1",
  });

  let response: Response;
  try {
    response = await fetch(`${ORS_BASE_URL}/geocode/search?${params.toString()}`);
  } catch (err) {
    throw new OrsNetworkError(err);
  }

  if (!response.ok) {
    throw new OrsRoutingError(
      `Error al geocodificar "${address}" (HTTP ${response.status}).`,
    );
  }

  const data = (await response.json()) as OrsGeocodeResponse;

  if (!data.features || data.features.length === 0) {
    throw new OrsGeocodingError(address);
  }

  const feature = data.features[0];
  return {
    label: feature.properties.label || enriched,
    coordinates: feature.geometry.coordinates,
  };
}

export async function getDrivingRoute(
  origin: [number, number],
  destination: [number, number],
): Promise<OrsDirectionsResponse> {
  const apiKey = getApiKey();

  let response: Response;
  try {
    response = await fetch(`${ORS_BASE_URL}/v2/directions/driving-car/geojson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        coordinates: [origin, destination],
      }),
    });
  } catch (err) {
    throw new OrsNetworkError(err);
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) detail = body.error.message;
    } catch {
      // ignore parse error — use HTTP status only
    }
    throw new OrsRoutingError(`Error al calcular la ruta: ${detail}`);
  }

  const data = (await response.json()) as OrsDirectionsResponse;

  if (!data.features || data.features.length === 0) {
    throw new OrsRoutingError();
  }

  return data;
}
