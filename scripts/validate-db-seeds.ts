#!/usr/bin/env tsx
/**
 * validate-db-seeds.ts
 *
 * Reads data/processed/ JSON files and validates correctness before seeding.
 * Does NOT connect to Supabase. Does NOT execute SQL.
 *
 * Run:
 *   npm run validate-seeds
 *   — or —
 *   npx tsx scripts/validate-db-seeds.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT          = path.resolve(__dirname, "..");
const PROCESSED_DIR = path.join(ROOT, "data", "processed");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let errors  = 0;
let warnings = 0;

function fail(msg: string): void {
  console.error(`  ✗ FAIL  ${msg}`);
  errors++;
}

function warn(msg: string): void {
  console.warn(`  ⚠ WARN  ${msg}`);
  warnings++;
}

function pass(msg: string): void {
  console.log(`  ✓ PASS  ${msg}`);
}

function readProcessed<T>(filename: string): T[] | null {
  const filePath = path.join(PROCESSED_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
}

function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

// ---------------------------------------------------------------------------
// Type interfaces (mirrors prepare-db-seeds.ts output)
// ---------------------------------------------------------------------------

interface Commune {
  zona_id: string;
  comuna_numero: number;
  name: string;
}

interface RiskProfile {
  zona_id: string;
  valid_from: string;
  criminalidad: number;
  seguridad: number;
  vigilancia: number;
  iluminacion: number;
  flujo_personas: number;
  risk_score: number;
  risk_level: string;
  data_quality: string;
}

interface AnnualIndicator {
  zona_id: string;
  year: number;
  indicator: string;
  value: number;
  granularity: string;
}

interface TimeWindow {
  horario_id: string;
  label: string;
  start_time: string;
  end_time: string;
  homicidios_2024: number | null;
  homicidios_2025: number | null;
  risk_score: number | null;
  risk_level: string;
}

interface ModelCoefficient {
  model_code: string;
  variable_code: string;
  variable_name: string;
  coefficient: number;
  effect_direction: string;
}

interface CommuneGeometry {
  comuna_numero: number;
  nombre: string;
  geometry_type: string;
  geometry_source: string;
  geometry: { type: string; coordinates: unknown };
}

// ---------------------------------------------------------------------------
// Validations
// ---------------------------------------------------------------------------

function validateCommunes(communes: Commune[]): void {
  console.log("\n▶ communes.json");

  // Count
  if (communes.length === 22) {
    pass(`22 communes present`);
  } else {
    fail(`Expected 22 communes, got ${communes.length}`);
  }

  // Numbers 1–22 without gaps or duplicates
  const numbers = communes.map((c) => c.comuna_numero).sort((a, b) => a - b);
  const expected = Array.from({ length: 22 }, (_, i) => i + 1);
  const missing   = expected.filter((n) => !numbers.includes(n));
  const extra     = numbers.filter((n) => !expected.includes(n));
  const dupes     = numbers.filter((n, i) => numbers.indexOf(n) !== i);

  if (missing.length === 0 && extra.length === 0 && dupes.length === 0) {
    pass(`comarca_numero 1–22 present, no gaps, no duplicates`);
  } else {
    if (missing.length > 0) fail(`Missing comuna_numero: ${missing.join(", ")}`);
    if (extra.length > 0)   fail(`Unexpected comuna_numero: ${extra.join(", ")}`);
    if (dupes.length > 0)   fail(`Duplicate comuna_numero: ${dupes.join(", ")}`);
  }

  // zona_id uniqueness
  const zonaIds = communes.map((c) => c.zona_id);
  const dupeZonas = zonaIds.filter((id, i) => zonaIds.indexOf(id) !== i);
  if (dupeZonas.length === 0) {
    pass(`zona_id values are unique`);
  } else {
    fail(`Duplicate zona_id: ${dupeZonas.join(", ")}`);
  }

  // Non-empty names
  const emptyNames = communes.filter((c) => !c.name.trim());
  if (emptyNames.length === 0) {
    pass(`All communes have non-empty names`);
  } else {
    fail(`Communes with empty name: ${emptyNames.map((c) => c.zona_id).join(", ")}`);
  }
}

function validateRiskProfiles(profiles: RiskProfile[], communes: Commune[]): void {
  console.log("\n▶ commune_risk_profiles.json");

  const validZonaIds = new Set(communes.map((c) => c.zona_id));
  const numericFields = ["criminalidad", "seguridad", "vigilancia", "iluminacion", "flujo_personas", "risk_score"] as const;
  const validLevels = new Set(["low", "medium", "high"]);

  let outOfRange = 0;
  let unknownZona = 0;
  let badLevel = 0;

  for (const p of profiles) {
    if (!validZonaIds.has(p.zona_id)) {
      fail(`Risk profile references unknown zona_id "${p.zona_id}"`);
      unknownZona++;
    }
    for (const field of numericFields) {
      const val = p[field];
      if (!inRange(val, 0, 100)) {
        fail(`${p.zona_id}.${field} = ${val} is outside [0, 100]`);
        outOfRange++;
      }
    }
    if (!validLevels.has(p.risk_level)) {
      fail(`${p.zona_id}.risk_level = "${p.risk_level}" is invalid`);
      badLevel++;
    }
  }

  if (outOfRange === 0) pass(`All variables within [0, 100]`);
  if (unknownZona === 0) pass(`All profiles reference known zona_id`);
  if (badLevel === 0)   pass(`All risk_level values are valid (low | medium | high)`);

  // Check risk_level consistency with risk_score
  let inconsistent = 0;
  for (const p of profiles) {
    const expected = p.risk_score >= 70 ? "high" : p.risk_score >= 40 ? "medium" : "low";
    if (p.risk_level !== expected) {
      warn(`${p.zona_id}: risk_score=${p.risk_score} → expected "${expected}" but got "${p.risk_level}"`);
      inconsistent++;
    }
  }
  if (inconsistent === 0) pass(`risk_level consistent with risk_score thresholds (<40=low, 40–69=medium, ≥70=high)`);
}

function validateAnnualIndicators(indicators: AnnualIndicator[], communes: Commune[]): void {
  console.log("\n▶ annual_crime_indicators.json");

  const validZonaIds = new Set(communes.map((c) => c.zona_id));
  let negativeValues = 0;
  let unknownZona = 0;
  let badYear = 0;

  for (const ind of indicators) {
    if (!validZonaIds.has(ind.zona_id)) {
      fail(`Indicator references unknown zona_id "${ind.zona_id}"`);
      unknownZona++;
    }
    if (ind.value < 0) {
      fail(`Negative indicator value: ${ind.zona_id} / ${ind.year} / ${ind.indicator} = ${ind.value}`);
      negativeValues++;
    }
    if (ind.year < 2000 || ind.year > 2100) {
      fail(`Year out of range: ${ind.year} for ${ind.zona_id}`);
      badYear++;
    }
  }

  if (negativeValues === 0) pass(`No negative indicator values`);
  if (unknownZona === 0)    pass(`All indicators reference known zona_id`);
  if (badYear === 0)        pass(`All years within [2000, 2100]`);

  // Duplicate check
  const keys = indicators.map((i) => `${i.zona_id}|${i.year}|${i.indicator}`);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length === 0) {
    pass(`No duplicate (zona_id, year, indicator) combinations`);
  } else {
    fail(`Duplicate indicator keys: ${[...new Set(dupes)].join("; ")}`);
  }
}

function validateTimeWindows(windows: TimeWindow[]): void {
  console.log("\n▶ risk_time_windows.json");

  const validLevels = new Set(["BAJO", "MEDIO", "ALTO"]);
  let badLevel = 0;
  let badScore = 0;
  let badHomicidios = 0;

  for (const w of windows) {
    if (!validLevels.has(w.risk_level)) {
      fail(`Time window "${w.horario_id}".risk_level = "${w.risk_level}" is invalid`);
      badLevel++;
    }
    if (w.risk_score !== null && !inRange(w.risk_score, 0, 10)) {
      fail(`Time window "${w.horario_id}".risk_score = ${w.risk_score} outside [0, 10]`);
      badScore++;
    }
    if (w.homicidios_2024 !== null && w.homicidios_2024 < 0) {
      fail(`Negative homicidios_2024 for "${w.horario_id}"`);
      badHomicidios++;
    }
    if (w.homicidios_2025 !== null && w.homicidios_2025 < 0) {
      fail(`Negative homicidios_2025 for "${w.horario_id}"`);
      badHomicidios++;
    }
  }

  if (badLevel === 0)      pass(`All risk_level values valid (BAJO | MEDIO | ALTO)`);
  if (badScore === 0)      pass(`All risk_score values within [0, 10]`);
  if (badHomicidios === 0) pass(`No negative homicidios values`);

  // Duplicate horario_id
  const ids = windows.map((w) => w.horario_id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length === 0) {
    pass(`No duplicate horario_id values`);
  } else {
    fail(`Duplicate horario_id: ${dupes.join(", ")}`);
  }
}

function validateCommuneGeometries(geometries: CommuneGeometry[]): void {
  console.log("\n▶ commune_geometries.json");

  if (geometries.length === 22) {
    pass(`22 geometry records present`);
  } else {
    fail(`Expected 22 geometry records, got ${geometries.length}`);
  }

  const nums = geometries.map((g) => g.comuna_numero).sort((a, b) => a - b);
  const expected = Array.from({ length: 22 }, (_, i) => i + 1);
  const missing = expected.filter((n) => !nums.includes(n));
  const dupes   = nums.filter((n, i) => nums.indexOf(n) !== i);

  if (missing.length === 0 && dupes.length === 0) {
    pass(`comuna_numero 1–22 present, no gaps, no duplicates`);
  } else {
    if (missing.length > 0) fail(`Missing comuna_numero: ${missing.join(", ")}`);
    if (dupes.length > 0)   fail(`Duplicate comuna_numero: ${dupes.join(", ")}`);
  }

  const validTypes = new Set(["Polygon", "MultiPolygon"]);
  const badTypes = geometries.filter((g) => !validTypes.has(g.geometry_type));
  if (badTypes.length === 0) {
    pass(`All geometry_type values valid (Polygon | MultiPolygon)`);
  } else {
    fail(`Invalid geometry_type: ${badTypes.map((g) => `${g.comuna_numero}=${g.geometry_type}`).join(", ")}`);
  }

  const missingGeometry = geometries.filter((g) => !g.geometry || !g.geometry.coordinates);
  if (missingGeometry.length === 0) {
    pass(`All records have geometry with coordinates`);
  } else {
    fail(`Missing geometry.coordinates for: ${missingGeometry.map((g) => g.comuna_numero).join(", ")}`);
  }
}

function validateModelCoefficients(coefficients: ModelCoefficient[]): void {
  console.log("\n▶ risk_model_coefficients.json");

  const REQUIRED_CODES = ["C", "S", "V", "I", "F"];
  const eulerCoeffs = coefficients.filter((c) => c.model_code === "euler-v1");
  const presentCodes = eulerCoeffs.map((c) => c.variable_code);

  const missing = REQUIRED_CODES.filter((code) => !presentCodes.includes(code));
  if (missing.length === 0) {
    pass(`Euler v1 coefficients complete: C, S, V, I, F present`);
  } else {
    fail(`Missing Euler v1 coefficients: ${missing.join(", ")}`);
  }

  const validDirections = new Set(["increase", "decrease"]);
  const badDirection = eulerCoeffs.filter((c) => !validDirections.has(c.effect_direction));
  if (badDirection.length === 0) {
    pass(`All effect_direction values valid (increase | decrease)`);
  } else {
    fail(`Invalid effect_direction: ${badDirection.map((c) => c.variable_code).join(", ")}`);
  }

  // Verify expected Euler v1 values
  const EXPECTED: Record<string, number> = { C: 30, S: 15, V: 10, I: 10, F: 8 };
  let valueOk = true;
  for (const coeff of eulerCoeffs) {
    const expected = EXPECTED[coeff.variable_code];
    if (expected !== undefined && coeff.coefficient !== expected) {
      warn(`Euler v1 ${coeff.variable_code}: expected coefficient ${expected}, got ${coeff.coefficient}`);
      valueOk = false;
    }
  }
  if (valueOk) pass(`Euler v1 coefficient values match expected (C=30, S=15, V=10, I=10, F=8)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function skipSection(filename: string, command: string): void {
  console.log(`\n▶ ${filename}`);
  warn(`${filename} not found — run '${command}' to generate it`);
}

async function main(): Promise<void> {
  console.log("Safe Maps — Seed Validation\n");

  // Excel-based seeds — skip with warning if prepare-seeds hasn't been run yet
  const communes    = readProcessed<Commune>("communes.json");
  const profiles    = readProcessed<RiskProfile>("commune_risk_profiles.json");
  const indicators  = readProcessed<AnnualIndicator>("annual_crime_indicators.json");
  const windows     = readProcessed<TimeWindow>("risk_time_windows.json");
  const coefficients = readProcessed<ModelCoefficient>("risk_model_coefficients.json");

  const excelMissing = [communes, profiles, indicators, windows, coefficients].some((d) => d === null);
  if (excelMissing) {
    skipSection("communes.json + Excel seeds", "npm run prepare-seeds");
  } else {
    validateCommunes(communes!);
    validateRiskProfiles(profiles!, communes!);
    validateAnnualIndicators(indicators!, communes!);
    validateTimeWindows(windows!);
    validateModelCoefficients(coefficients!);
  }

  // Geometry seed — generated separately from GeoJSON, no Excel needed
  const geomPath = path.join(PROCESSED_DIR, "commune_geometries.json");
  if (fs.existsSync(geomPath)) {
    const geometries = JSON.parse(fs.readFileSync(geomPath, "utf-8")) as CommuneGeometry[];
    validateCommuneGeometries(geometries);
  } else {
    skipSection("commune_geometries.json", "npm run prepare-geometry-seed");
  }

  console.log("\n" + "─".repeat(50));
  if (errors === 0 && warnings === 0) {
    console.log("✓ All validations passed. Seeds are ready.");
    console.log("  Next: apply supabase/migrations/ then run data/seeds/ SQL files.");
  } else {
    if (warnings > 0) console.warn(`⚠ ${warnings} warning(s) detected.`);
    if (errors > 0) {
      console.error(`✗ ${errors} error(s) detected. Fix before seeding.`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("\n✗ Error:", (err as Error).message);
  process.exit(1);
});
