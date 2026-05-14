import fs from "node:fs/promises";
import path from "node:path";
import type { CommunesGeoJSON } from "./geojson-types";

let cache: CommunesGeoJSON | null = null;

export async function loadCommunesGeoJSON(): Promise<CommunesGeoJSON> {
  if (cache) return cache;
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "comunas-cali.geojson",
  );
  const content = await fs.readFile(filePath, "utf-8");
  cache = JSON.parse(content) as CommunesGeoJSON;
  return cache;
}
