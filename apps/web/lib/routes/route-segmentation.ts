const EARTH_RADIUS_METERS = 6_371_000;

// Target segment length. Produces ~8–15 segments for a typical urban route in Cali.
const TARGET_SEGMENT_METERS = 400;

export interface CoordChunk {
  coords: [number, number][];
  distanceMeters: number;
}

export function haversineMeters(
  a: [number, number],
  b: [number, number],
): number {
  const [lonA, latA] = a;
  const [lonB, latB] = b;

  const dLat = ((latB - latA) * Math.PI) / 180;
  const dLon = ((lonB - lonA) * Math.PI) / 180;
  const lat1Rad = (latA * Math.PI) / 180;
  const lat2Rad = (latB * Math.PI) / 180;

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLon = Math.sin(dLon / 2);

  const h =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinHalfDLon * sinHalfDLon;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Splits a coordinate array into chunks where each chunk spans approximately
 * TARGET_SEGMENT_METERS of road distance (Haversine). The last coordinate of
 * each chunk is reused as the first coordinate of the next, keeping the path
 * continuous. Every chunk is guaranteed to have >= 2 points.
 */
export function segmentByDistance(coords: [number, number][]): CoordChunk[] {
  if (coords.length < 2) {
    throw new Error(
      `Route geometry has ${coords.length} coordinate(s); at least 2 required.`,
    );
  }

  const segments: CoordChunk[] = [];
  let currentChunk: [number, number][] = [coords[0]];
  let currentDistance = 0;

  for (let i = 1; i < coords.length; i++) {
    const step = haversineMeters(coords[i - 1], coords[i]);
    currentDistance += step;
    currentChunk.push(coords[i]);

    const isLast = i === coords.length - 1;

    if (!isLast && currentDistance >= TARGET_SEGMENT_METERS) {
      segments.push({
        coords: currentChunk,
        distanceMeters: Math.round(currentDistance),
      });
      // Overlap: next segment starts at the current end point.
      currentChunk = [coords[i]];
      currentDistance = 0;
    }
  }

  // Always push remaining coords — guaranteed >= 2 points.
  segments.push({
    coords: currentChunk,
    distanceMeters: Math.max(1, Math.round(currentDistance)),
  });

  return segments;
}
