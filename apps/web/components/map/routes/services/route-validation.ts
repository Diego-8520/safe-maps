export interface RouteValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateRouteInput(origin: string, destination: string): RouteValidationResult {
  const cleanOrigin = origin.trim();
  const cleanDestination = destination.trim();

  if (!cleanOrigin || !cleanDestination) {
    return { valid: false, error: "Ingresa un origen y un destino para analizar la ruta." };
  }

  if (cleanOrigin.toLowerCase() === cleanDestination.toLowerCase()) {
    return { valid: false, error: "El origen y el destino deben ser diferentes." };
  }

  return { valid: true, error: null };
}
