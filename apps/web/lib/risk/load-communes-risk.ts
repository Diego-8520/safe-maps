import fs from "node:fs/promises";
import path from "node:path";
import type { CommuneRisk } from "./risk-types";

let cache: CommuneRisk[] | null = null;

export async function loadCommunesRisk(): Promise<CommuneRisk[]> {
  if (cache) return cache;
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "comunas-risk.json",
  );
  const content = await fs.readFile(filePath, "utf-8");
  cache = JSON.parse(content) as CommuneRisk[];
  return cache;
}
