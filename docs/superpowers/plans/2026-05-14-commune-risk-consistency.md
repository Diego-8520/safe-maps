# Commune Risk Score Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate divergent commune risk score reads by routing all risk data through a single `GET /api/communes/risk` endpoint backed by the existing repository.

**Architecture:** A new Next.js API route serves `CommuneRisk[]` via `getCommuneRiskRepository()`, which already respects the `SAFE_MAPS_DATA_SOURCE` feature flag (local JSON or Supabase). `loadEnrichedGeojson()` is changed from a hardcoded static file fetch to this endpoint. All other files are untouched.

**Tech Stack:** Next.js 16 App Router, TypeScript, existing `CommuneRiskRepository` interface.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `apps/web/app/api/communes/risk/route.ts` | `GET /api/communes/risk` — returns `CommuneRisk[]` via repository |
| **Modify** | `apps/web/components/map/data/load-communes.ts` | Change fetch URL from static file to the new endpoint (line 17) |

No other files change.

---

## Task 1: Create `GET /api/communes/risk` endpoint

**Files:**
- Create: `apps/web/app/api/communes/risk/route.ts`

- [ ] **Step 1.1: Create directory and file**

```
apps/web/app/api/communes/risk/route.ts
```

Full file contents:

```ts
import { NextResponse } from "next/server";
import { getCommuneRiskRepository } from "@/lib/repositories/repository-factory";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCommuneRiskRepository().getAll();
  return NextResponse.json(data);
}
```

- [ ] **Step 1.2: Verify TypeScript compiles**

Run from `apps/web/`:
```bash
npx tsc --noEmit
```

Expected: no errors. If errors appear, check import path `@/lib/repositories/repository-factory` matches the project's `tsconfig.json` path aliases (alias `@` maps to `apps/web/`).

- [ ] **Step 1.3: Verify lint passes**

Run from `apps/web/`:
```bash
npx eslint app/api/communes/risk/route.ts
```

Expected: no errors or warnings.

- [ ] **Step 1.4: Verify endpoint responds correctly**

Start dev server:
```bash
npm run dev
```

In a separate terminal:
```bash
curl http://localhost:3000/api/communes/risk
```

Expected: JSON array with 22 objects, each containing:
```json
{
  "comuna": <number 1-22>,
  "riskScore": <number 0-100>,
  "riskLevel": "low" | "medium" | "high",
  "criminalidad": <number>,
  "seguridad": <number>,
  "vigilancia": <number>,
  "iluminacion": <number>,
  "flujoPersonas": <number>
}
```

- [ ] **Step 1.5: Commit**

```bash
git add apps/web/app/api/communes/risk/route.ts
git commit -m "feat(api): add GET /api/communes/risk endpoint via repository"
```

---

## Task 2: Wire `loadEnrichedGeojson()` to the new endpoint

**Files:**
- Modify: `apps/web/components/map/data/load-communes.ts:17`

- [ ] **Step 2.1: Change the fetch URL**

In `apps/web/components/map/data/load-communes.ts`, find line 17:

```ts
    fetch("/data/comunas-risk.json"),
```

Change to:

```ts
    fetch("/api/communes/risk"),
```

Full context of the change (lines 14–18 after edit):

```ts
export async function loadEnrichedGeojson(): Promise<GeoJSON.FeatureCollection> {
  const [geojsonRes, riskRes] = await Promise.all([
    fetch("/data/comunas-cali.geojson"),
    fetch("/api/communes/risk"),
  ]);
```

Everything else in the file stays identical.

- [ ] **Step 2.2: Verify TypeScript still compiles**

Run from `apps/web/`:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.3: Verify the map loads with consistent data**

With dev server running (`npm run dev`):

1. Open `http://localhost:3000` in browser
2. Observe that commune polygons render with colored fills (low=green, medium=orange, high=red)
3. Hover over any commune — popup should show `riskScore` and `riskLevel`
4. Click a commune — sidebar panel should show the same `riskScore` and `riskLevel` as the popup
5. Request a route that passes through that commune
6. In the route segments table, find a segment whose commune matches — `localRiskScore` must equal the `riskScore` from step 4

- [ ] **Step 2.4: Verify consistency invariant**

Pick commune 10 (known value: `riskScore: 47`, `riskLevel: "medium"`):

1. Check `GET /api/communes/risk` — find `{ "comuna": 10, "riskScore": 47, "riskLevel": "medium" }`
2. Hover commune 10 on map — popup shows `47` / `medium`
3. Click commune 10 — sidebar panel shows `47` / `medium`
4. Request a route starting in commune 10 — `initialRiskScore` in route summary shows `47`
5. Route segment whose midpoint is in commune 10 — `localRiskScore` shows `47`

All five values must match.

- [ ] **Step 2.5: Commit**

```bash
git add apps/web/components/map/data/load-communes.ts
git commit -m "fix(map): load commune risk via /api/communes/risk instead of static file"
```

---

## Self-Review Notes

**Spec coverage:**
- ✅ New endpoint `GET /api/communes/risk` with `force-dynamic` — Task 1
- ✅ `loadEnrichedGeojson()` fetch URL change — Task 2
- ✅ Consistency invariant verified manually — Task 2.4
- ✅ No other files changed — confirmed by file map
- ✅ Error handling: `loadEnrichedGeojson()` existing `!riskRes.ok` guard covers the new endpoint too — no new code needed

**No placeholders:** all steps include exact file contents, exact commands, expected outputs.

**Type consistency:** `getCommuneRiskRepository().getAll()` returns `Promise<CommuneRisk[]>`. `NextResponse.json(data)` serializes it. `loadEnrichedGeojson()` casts the response as `CommuneRiskData[]` which is `= CommuneRisk` (alias in `components/map/types.ts`). No type mismatch.
