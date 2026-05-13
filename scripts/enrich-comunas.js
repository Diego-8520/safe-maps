#!/usr/bin/env node
/**
 * Enriches comunas-cali.geojson with mock risk data.
 * Adds riskScore and riskLevel to each feature's properties.
 * Does NOT modify geometries or coordinates.
 */

const fs = require("fs");
const path = require("path");

const GEOJSON_PATH = path.resolve(
  __dirname,
  "../apps/web/public/data/comunas-cali.geojson"
);

// Mock risk data keyed by commune number (academically motivated values)
const RISK_DATA = {
  1:  { riskScore: 54 },
  2:  { riskScore: 28 },
  3:  { riskScore: 48 },
  4:  { riskScore: 45 },
  5:  { riskScore: 52 },
  6:  { riskScore: 32 },
  7:  { riskScore: 58 },
  8:  { riskScore: 51 },
  9:  { riskScore: 63 },
  10: { riskScore: 47 },
  11: { riskScore: 55 },
  12: { riskScore: 38 },
  13: { riskScore: 84 },
  14: { riskScore: 78 },
  15: { riskScore: 76 },
  16: { riskScore: 72 },
  17: { riskScore: 25 },
  18: { riskScore: 60 },
  19: { riskScore: 22 },
  20: { riskScore: 81 },
  21: { riskScore: 74 },
  22: { riskScore: 18 },
};

function scoreToLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

const raw = fs.readFileSync(GEOJSON_PATH, "utf8");
const geojson = JSON.parse(raw);

let enriched = 0;
let skipped = 0;

for (const feature of geojson.features) {
  const num = feature.properties.comuna;
  const data = RISK_DATA[num];

  if (!data) {
    console.warn(`No risk data for comuna ${num} — skipping`);
    skipped++;
    continue;
  }

  feature.properties.riskScore = data.riskScore;
  feature.properties.riskLevel = scoreToLevel(data.riskScore);
  enriched++;
}

fs.writeFileSync(GEOJSON_PATH, JSON.stringify(geojson), "utf8");

console.log(`Done. Enriched: ${enriched}, Skipped: ${skipped}`);
console.log(`Output: ${GEOJSON_PATH}`);
