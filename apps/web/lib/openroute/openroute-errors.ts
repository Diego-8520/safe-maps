export class OrsApiKeyMissingError extends Error {
  constructor() {
    super("OPENROUTE_API_KEY no está configurada en el servidor.");
    this.name = "OrsApiKeyMissingError";
  }
}

export class OrsGeocodingError extends Error {
  constructor(address: string) {
    super(`No se encontró la dirección: "${address}". Intenta ser más específico (ej: "Centro, Cali, Colombia").`);
    this.name = "OrsGeocodingError";
  }
}

export class OrsRoutingError extends Error {
  constructor(message?: string) {
    super(message ?? "No se pudo calcular una ruta entre los puntos indicados.");
    this.name = "OrsRoutingError";
  }
}

export class OrsNetworkError extends Error {
  constructor(cause?: unknown) {
    super("OpenRouteService no responde. Intenta nuevamente.");
    this.name = "OrsNetworkError";
    if (cause) this.cause = cause;
  }
}
