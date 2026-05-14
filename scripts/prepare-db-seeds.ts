#!/usr/bin/env tsx
/**
 * prepare-db-seeds.ts
 *
 * Reads data/raw/safe_maps_dataset_db_ready.xlsx and generates:
 *   data/processed/  — clean JSON files per entity
 *   data/seeds/      — INSERT SQL files in dependency order
 *
 * Prerequisites:
 *   npm install            (at repo root — installs xlsx and tsx)
 *   Place Excel file at:   data/raw/safe_maps_dataset_db_ready.xlsx
 *
 * Run:
 *   npm run prepare-seeds
 *   — or —
 *   npx tsx scripts/prepare-db-seeds.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// xlsx import — requires: npm install (at root package.json)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx") as typeof import("xlsx");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT         = path.resolve(__dirname, "..");
const RAW_DIR      = path.join(ROOT, "data", "raw");
const PROCESSED_DIR = path.join(ROOT, "data", "processed");
const SEEDS_DIR    = path.join(ROOT, "data", "seeds");
const EXCEL_PATH   = path.join(RAW_DIR, "safe_maps_dataset_db_ready.xlsx");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProcessedCommune {
  zona_id: string;
  comuna_numero: number;
  name: string;
}

interface ProcessedRiskProfile {
  zona_id: string;
  valid_from: string;
  criminalidad: number;
  seguridad: number;
  vigilancia: number;
  iluminacion: number;
  flujo_personas: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  data_quality: "simulated";
}

interface ProcessedAnnualIndicator {
  zona_id: string;
  year: number;
  indicator: string;
  value: number;
  granularity: string;
}

interface ProcessedTimeWindow {
  horario_id: string;
  label: string;
  start_time: string;
  end_time: string;
  homicidios_2024: number | null;
  homicidios_2025: number | null;
  variation_absolute: number | null;
  variation_pct: number | null;
  risk_score: number | null;
  risk_level: "BAJO" | "MEDIO" | "ALTO";
}

interface ProcessedDataSource {
  name: string;
  source_type: "official" | "academic" | "simulated" | "estimated";
  url: string | null;
  description: string | null;
  reliability_level: "alta" | "media" | "baja" | "simulada";
  collected_at: string | null;
}

interface ProcessedModelVersion {
  code: string;
  name: string;
  description: string;
  formula: string;
  is_active: boolean;
}

interface ProcessedModelCoefficient {
  model_code: string;
  variable_code: string;
  variable_name: string;
  coefficient: number;
  effect_direction: "increase" | "decrease";
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

function writeSQL(filePath: string, sql: string): void {
  fs.writeFileSync(filePath, sql, "utf-8");
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

function requireSheet(workbook: import("xlsx").WorkBook, name: string): import("xlsx").WorkSheet {
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    const available = workbook.SheetNames.join(", ");
    throw new Error(
      `Required sheet "${name}" not found in Excel.\n` +
      `Available sheets: ${available}\n` +
      `Check that the file is safe_maps_dataset_db_ready.xlsx with the correct sheet names.`
    );
  }
  return sheet;
}

function sheetToRows(sheet: import("xlsx").WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<string, unknown>[];
}

function toNumber(val: unknown, fieldName: string): number {
  const n = Number(val);
  if (!isFinite(n)) throw new Error(`Expected a number for "${fieldName}", got: ${JSON.stringify(val)}`);
  return n;
}

function toNullableInt(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}

function toNullableFloat(val: unknown, decimals = 4): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = parseFloat(String(val));
  return isNaN(n) ? null : parseFloat(n.toFixed(decimals));
}

function scoreToRiskLevel(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function mapRiskLevelSpanish(raw: unknown): "BAJO" | "MEDIO" | "ALTO" {
  const s = String(raw ?? "").toUpperCase().trim();
  if (s === "BAJO"  || s === "LOW"  || s === "1") return "BAJO";
  if (s === "MEDIO" || s === "MEDIUM" || s === "MED" || s === "2") return "MEDIO";
  if (s === "ALTO"  || s === "HIGH" || s === "3") return "ALTO";
  throw new Error(`Unrecognized risk_level value: "${raw}". Expected BAJO, MEDIO, or ALTO.`);
}

function escapeSQL(val: string | null | undefined): string {
  if (val === null || val === undefined) return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

function toSQLDate(date: string | null | undefined): string {
  if (!date) return "NULL";
  return `'${date}'`;
}

function toSQLNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "NULL";
  return String(n);
}

// ---------------------------------------------------------------------------
// Processors
// ---------------------------------------------------------------------------

function processDimZonas(sheet: import("xlsx").WorkSheet): ProcessedCommune[] {
  const rows = sheetToRows(sheet);
  const result: ProcessedCommune[] = rows
    .map((row) => {
      const zona_id = String(row["zona_id"] ?? "").trim();
      const nombre  = String(row["nombre"] ?? row["name"] ?? "").trim();

      if (!zona_id) throw new Error(`dim_zonas: row missing zona_id: ${JSON.stringify(row)}`);

      // Extract number from zona_id (ZO001 → 1) or from a dedicated column
      const numero_raw = row["comuna_numero"] ?? row["numero"] ?? row["id_comuna"];
      let comuna_numero: number;
      if (numero_raw !== null && numero_raw !== undefined) {
        comuna_numero = parseInt(String(numero_raw), 10);
      } else {
        const match = zona_id.match(/\d+/);
        if (!match) throw new Error(`Cannot derive comuna_numero from zona_id "${zona_id}"`);
        comuna_numero = parseInt(match[0], 10);
      }

      if (isNaN(comuna_numero) || comuna_numero < 1 || comuna_numero > 22) {
        throw new Error(`Invalid comuna_numero ${comuna_numero} for zona_id "${zona_id}"`);
      }

      const name = nombre || `Comuna ${comuna_numero}`;

      return { zona_id, comuna_numero, name };
    })
    .sort((a, b) => a.comuna_numero - b.comuna_numero);

  return result;
}

function processVariablesModelo(sheet: import("xlsx").WorkSheet): ProcessedRiskProfile[] {
  const rows = sheetToRows(sheet);
  return rows.map((row) => {
    const zona_id = String(row["zona_id"] ?? "").trim();
    if (!zona_id) throw new Error(`variables_modelo: row missing zona_id: ${JSON.stringify(row)}`);

    const criminalidad   = toNumber(row["criminalidad_C_0_10"]   ?? row["criminalidad"],   "criminalidad")   * 10;
    const seguridad      = toNumber(row["seguridad_S_0_10"]      ?? row["seguridad"],       "seguridad")      * 10;
    const vigilancia     = toNumber(row["vigilancia_V_0_10"]     ?? row["vigilancia"],      "vigilancia")     * 10;
    const iluminacion    = toNumber(row["iluminacion_I_0_10"]    ?? row["iluminacion"],     "iluminacion")    * 10;
    const flujo_personas = toNumber(row["flujo_personas_F_0_10"] ?? row["flujo_personas"],  "flujo_personas") * 10;
    const risk_score     = toNumber(row["indice_riesgo_base_0_10"] ?? row["risk_score"],    "risk_score")     * 10;

    const round2 = (n: number) => parseFloat(n.toFixed(2));

    return {
      zona_id,
      valid_from: "2024-01-01",
      criminalidad:   round2(criminalidad),
      seguridad:      round2(seguridad),
      vigilancia:     round2(vigilancia),
      iluminacion:    round2(iluminacion),
      flujo_personas: round2(flujo_personas),
      risk_score:     round2(risk_score),
      risk_level:     scoreToRiskLevel(risk_score),
      data_quality:   "simulated" as const,
    };
  });
}

function processFactHomicidios(sheet: import("xlsx").WorkSheet): ProcessedAnnualIndicator[] {
  const rows = sheetToRows(sheet);
  const result: ProcessedAnnualIndicator[] = rows.map((row) => {
    const zona_id = String(row["zona_id"] ?? "").trim();
    const year    = parseInt(String(row["year"] ?? row["anio"] ?? ""), 10);
    const value   = parseInt(String(row["value"] ?? row["homicidios"] ?? row["cantidad"] ?? ""), 10);

    if (!zona_id) throw new Error(`fact_homicidios_anual: missing zona_id: ${JSON.stringify(row)}`);
    if (isNaN(year)) throw new Error(`fact_homicidios_anual: invalid year: ${JSON.stringify(row)}`);
    if (isNaN(value) || value < 0) throw new Error(`fact_homicidios_anual: invalid value: ${JSON.stringify(row)}`);

    return {
      zona_id,
      year,
      indicator: "homicidio",
      value,
      granularity: "conteo_anual_comuna",
    };
  }).sort((a, b) => a.zona_id.localeCompare(b.zona_id) || a.year - b.year);

  return result;
}

function processDimHorarios(sheet: import("xlsx").WorkSheet): ProcessedTimeWindow[] {
  const rows = sheetToRows(sheet);
  return rows.map((row) => {
    const horario_id = String(row["horario_id"] ?? "").trim();
    const label      = String(row["label"] ?? row["descripcion"] ?? row["horario"] ?? "").trim();
    const start_time = String(row["start_time"] ?? row["hora_inicio"] ?? "").trim();
    const end_time   = String(row["end_time"]   ?? row["hora_fin"]    ?? "").trim();

    if (!horario_id) throw new Error(`dim_horarios_riesgo: missing horario_id: ${JSON.stringify(row)}`);
    if (!start_time || !end_time) {
      throw new Error(`dim_horarios_riesgo: missing start_time/end_time for "${horario_id}"`);
    }

    const nivel_raw = row["nivel_riesgo"] ?? row["risk_level"] ?? row["riesgo"];
    const risk_level = mapRiskLevelSpanish(nivel_raw);

    return {
      horario_id,
      label,
      start_time,
      end_time,
      homicidios_2024:    toNullableInt(row["homicidios_2024"]),
      homicidios_2025:    toNullableInt(row["homicidios_2025"]),
      variation_absolute: toNullableInt(row["variation_absolute"] ?? row["variacion_absoluta"]),
      variation_pct:      toNullableFloat(row["variation_pct"] ?? row["variacion_pct"], 4),
      risk_score:         toNullableFloat(row["risk_score"] ?? row["indice_riesgo"], 2),
      risk_level,
    };
  });
}

function processDataSources(sheet: import("xlsx").WorkSheet | undefined): ProcessedDataSource[] {
  if (!sheet) {
    // Default source if sheet not present
    return [{
      name:              "Safe Maps — Dataset Académico v1",
      source_type:       "simulated",
      url:               null,
      description:       "Dataset inicial generado con valores académicos/estimados para prototipo.",
      reliability_level: "simulada",
      collected_at:      "2024-01-01",
    }];
  }
  return sheetToRows(sheet).map((row) => ({
    name:              String(row["name"] ?? ""),
    source_type:       (row["source_type"] ?? "simulated") as ProcessedDataSource["source_type"],
    url:               row["url"] ? String(row["url"]) : null,
    description:       row["description"] ? String(row["description"]) : null,
    reliability_level: (row["reliability_level"] ?? "simulada") as ProcessedDataSource["reliability_level"],
    collected_at:      row["collected_at"] ? String(row["collected_at"]) : null,
  }));
}

function buildModelVersions(): ProcessedModelVersion[] {
  return [{
    code:        "euler-v1",
    name:        "Euler v1 — Modelo diferencial lineal",
    description: "Integración numérica por método de Euler. dR/dx = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃.",
    formula:     "R(n+1) = clamp(R(n) + f(C,S,V,I,F) * Δx_km, 0, 100)",
    is_active:   true,
  }];
}

function buildModelCoefficients(): ProcessedModelCoefficient[] {
  return [
    { model_code: "euler-v1", variable_code: "C", variable_name: "criminalidad",  coefficient: 30, effect_direction: "increase" },
    { model_code: "euler-v1", variable_code: "S", variable_name: "seguridad",     coefficient: 15, effect_direction: "decrease" },
    { model_code: "euler-v1", variable_code: "V", variable_name: "vigilancia",    coefficient: 10, effect_direction: "decrease" },
    { model_code: "euler-v1", variable_code: "I", variable_name: "iluminacion",   coefficient: 10, effect_direction: "decrease" },
    { model_code: "euler-v1", variable_code: "F", variable_name: "flujo_personas", coefficient: 8, effect_direction: "increase" },
  ];
}

// ---------------------------------------------------------------------------
// SQL generators
// ---------------------------------------------------------------------------

function sqlDataSources(sources: ProcessedDataSource[]): string {
  const rows = sources.map((s) =>
    `  (${escapeSQL(s.name)}, ${escapeSQL(s.source_type)}, ${escapeSQL(s.url)}, ` +
    `${escapeSQL(s.description)}, ${escapeSQL(s.reliability_level)}, ${toSQLDate(s.collected_at)})`
  ).join(",\n");

  return `-- 001_data_sources.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY

INSERT INTO data_sources (name, source_type, url, description, reliability_level, collected_at)
VALUES
${rows};
`;
}

function sqlModelVersions(versions: ProcessedModelVersion[]): string {
  const rows = versions.map((v) =>
    `  (${escapeSQL(v.code)}, ${escapeSQL(v.name)}, ${escapeSQL(v.description)}, ` +
    `${escapeSQL(v.formula)}, ${v.is_active})`
  ).join(",\n");

  return `-- 002_risk_model_versions.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY

INSERT INTO risk_model_versions (code, name, description, formula, is_active)
VALUES
${rows};
`;
}

function sqlCommunes(communes: ProcessedCommune[]): string {
  const rows = communes.map((c) =>
    `  (${escapeSQL(c.zona_id)}, ${c.comuna_numero}, ${escapeSQL(c.name)})`
  ).join(",\n");

  return `-- 003_communes.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY
-- geometry column is intentionally omitted here.
-- Load geometry separately with a GeoJSON import script using ST_GeomFromGeoJSON().

INSERT INTO communes (zona_id, comuna_numero, name)
VALUES
${rows};
`;
}

function sqlModelCoefficients(coefficients: ProcessedModelCoefficient[]): string {
  const rows = coefficients.map((c) =>
    `  ((SELECT id FROM risk_model_versions WHERE code = ${escapeSQL(c.model_code)}), ` +
    `${escapeSQL(c.variable_code)}, ${escapeSQL(c.variable_name)}, ` +
    `${c.coefficient}, ${escapeSQL(c.effect_direction)})`
  ).join(",\n");

  return `-- 004_risk_model_coefficients.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY

INSERT INTO risk_model_coefficients (model_version_id, variable_code, variable_name, coefficient, effect_direction)
VALUES
${rows};
`;
}

function sqlRiskProfiles(profiles: ProcessedRiskProfile[], sources: ProcessedDataSource[]): string {
  const sourceName = escapeSQL(sources[0]?.name ?? null);
  const rows = profiles.map((p) =>
    `  (\n` +
    `    (SELECT id FROM communes WHERE zona_id = ${escapeSQL(p.zona_id)}),\n` +
    `    (SELECT id FROM risk_model_versions WHERE code = 'euler-v1'),\n` +
    `    ${toSQLDate(p.valid_from)}, NULL,\n` +
    `    ${p.criminalidad}, ${p.seguridad}, ${p.vigilancia}, ${p.iluminacion}, ${p.flujo_personas},\n` +
    `    ${p.risk_score}, ${escapeSQL(p.risk_level)}, ${escapeSQL(p.data_quality)},\n` +
    `    (SELECT id FROM data_sources WHERE name = ${sourceName})\n` +
    `  )`
  ).join(",\n");

  return `-- 005_commune_risk_profiles.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY
-- Variables transformed from 0–10 to 0–100 scale (×10).

INSERT INTO commune_risk_profiles
  (commune_id, model_version_id, valid_from, valid_to,
   criminalidad, seguridad, vigilancia, iluminacion, flujo_personas,
   risk_score, risk_level, data_quality, source_id)
VALUES
${rows};
`;
}

function sqlAnnualIndicators(indicators: ProcessedAnnualIndicator[], sources: ProcessedDataSource[]): string {
  const sourceName = escapeSQL(sources[0]?.name ?? null);
  const rows = indicators.map((i) =>
    `  ((SELECT id FROM communes WHERE zona_id = ${escapeSQL(i.zona_id)}), ` +
    `${i.year}, ${escapeSQL(i.indicator)}, ${i.value}, ${escapeSQL(i.granularity)}, ` +
    `(SELECT id FROM data_sources WHERE name = ${sourceName}))`
  ).join(",\n");

  return `-- 006_annual_crime_indicators.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY

INSERT INTO annual_crime_indicators (commune_id, year, indicator, value, granularity, source_id)
VALUES
${rows};
`;
}

function sqlTimeWindows(windows: ProcessedTimeWindow[], sources: ProcessedDataSource[]): string {
  const sourceName = escapeSQL(sources[0]?.name ?? null);
  const rows = windows.map((w) =>
    `  (${escapeSQL(w.horario_id)}, ${escapeSQL(w.label)}, ` +
    `'${w.start_time}', '${w.end_time}', ` +
    `${toSQLNumber(w.homicidios_2024)}, ${toSQLNumber(w.homicidios_2025)}, ` +
    `${toSQLNumber(w.variation_absolute)}, ${toSQLNumber(w.variation_pct)}, ` +
    `${toSQLNumber(w.risk_score)}, ${escapeSQL(w.risk_level)}, ` +
    `(SELECT id FROM data_sources WHERE name = ${sourceName}))`
  ).join(",\n");

  return `-- 007_risk_time_windows.sql
-- Generated by scripts/prepare-db-seeds.ts — DO NOT EDIT MANUALLY

INSERT INTO risk_time_windows
  (horario_id, label, start_time, end_time,
   homicidios_2024, homicidios_2025, variation_absolute, variation_pct,
   risk_score, risk_level, source_id)
VALUES
${rows};
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Safe Maps — Seed Preparation\n");

  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(
      `Excel file not found: ${EXCEL_PATH}\n` +
      `Place the file at: data/raw/safe_maps_dataset_db_ready.xlsx\n` +
      `Do not commit the Excel file — it is gitignored.`
    );
  }

  ensureDir(PROCESSED_DIR);
  ensureDir(SEEDS_DIR);

  console.log("Reading Excel...");
  const workbook = XLSX.readFile(EXCEL_PATH);

  console.log(`Sheets found: ${workbook.SheetNames.join(", ")}\n`);

  // Require sheets
  const dimZonasSheet       = requireSheet(workbook, "dim_zonas");
  const variablesSheet      = requireSheet(workbook, "variables_modelo");
  const homicidiosSheet     = requireSheet(workbook, "fact_homicidios_anual");
  const horariosSheet       = requireSheet(workbook, "dim_horarios_riesgo");
  const dataSourcesSheet    = workbook.Sheets["data_sources"]; // optional

  // Process
  console.log("Processing sheets...");
  const communes   = processDimZonas(dimZonasSheet);
  const profiles   = processVariablesModelo(variablesSheet);
  const indicators = processFactHomicidios(homicidiosSheet);
  const windows    = processDimHorarios(horariosSheet);
  const sources    = processDataSources(dataSourcesSheet);
  const versions   = buildModelVersions();
  const coefficients = buildModelCoefficients();

  // Write processed JSON
  console.log("\nWriting processed JSON...");
  writeJSON(path.join(PROCESSED_DIR, "communes.json"),               communes);
  writeJSON(path.join(PROCESSED_DIR, "commune_risk_profiles.json"),  profiles);
  writeJSON(path.join(PROCESSED_DIR, "annual_crime_indicators.json"), indicators);
  writeJSON(path.join(PROCESSED_DIR, "risk_time_windows.json"),      windows);
  writeJSON(path.join(PROCESSED_DIR, "data_sources.json"),           sources);
  writeJSON(path.join(PROCESSED_DIR, "risk_model_versions.json"),    versions);
  writeJSON(path.join(PROCESSED_DIR, "risk_model_coefficients.json"), coefficients);

  // Write SQL seeds
  console.log("\nWriting SQL seeds...");
  writeSQL(path.join(SEEDS_DIR, "001_data_sources.sql"),           sqlDataSources(sources));
  writeSQL(path.join(SEEDS_DIR, "002_risk_model_versions.sql"),    sqlModelVersions(versions));
  writeSQL(path.join(SEEDS_DIR, "003_communes.sql"),               sqlCommunes(communes));
  writeSQL(path.join(SEEDS_DIR, "004_risk_model_coefficients.sql"), sqlModelCoefficients(coefficients));
  writeSQL(path.join(SEEDS_DIR, "005_commune_risk_profiles.sql"),  sqlRiskProfiles(profiles, sources));
  writeSQL(path.join(SEEDS_DIR, "006_annual_crime_indicators.sql"), sqlAnnualIndicators(indicators, sources));
  writeSQL(path.join(SEEDS_DIR, "007_risk_time_windows.sql"),      sqlTimeWindows(windows, sources));

  console.log(`\n✓ Done.`);
  console.log(`  Communes processed:  ${communes.length}`);
  console.log(`  Risk profiles:       ${profiles.length}`);
  console.log(`  Annual indicators:   ${indicators.length}`);
  console.log(`  Time windows:        ${windows.length}`);
  console.log(`\nNext: run scripts/validate-db-seeds.ts`);
}

main().catch((err) => {
  console.error("\n✗ Error:", (err as Error).message);
  process.exit(1);
});
