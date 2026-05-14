import { formatDistanceKm } from "@/components/map/routes/route-utils";

// Properties as they arrive from MapLibre feature (all primitives, null may be stringified).
export interface RouteSegmentPopupProps {
  id: string;
  distanceMeters: number;
  communeId: number | null | string;
  localRiskScore: number;
  localRiskLevel: string;
  accumulatedRiskScore: number;
  accumulatedRiskLevel: string;
}

const LEVEL_COLOR: Record<string, string> = {
  low:    "#22c55e",
  medium: "#f59e0b",
  high:   "#ef4444",
};

const LEVEL_LABEL: Record<string, string> = {
  low:    "Bajo",
  medium: "Medio",
  high:   "Alto",
};

function segmentIndex(id: string): number {
  const last = id.split("-").pop() ?? "";
  const n = parseInt(last, 10);
  return isNaN(n) ? 0 : n;
}

function dot(color: string): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-right:5px;vertical-align:middle"></span>`;
}

function infoRow(label: string, valueHtml: string): string {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
      <span style="color:#64748b">${label}</span>
      <span style="color:#e2e8f0;display:flex;align-items:center">${valueHtml}</span>
    </div>`;
}

export function buildRouteSegmentPopupHtml(p: RouteSegmentPopupProps): string {
  const idx = segmentIndex(p.id);

  const isNullCommune = p.communeId === null || p.communeId === "null" || p.communeId === "";
  const commune = isNullCommune ? "Sin comuna" : `C${p.communeId}`;

  const localColor = LEVEL_COLOR[p.localRiskLevel]   ?? "#94a3b8";
  const accumColor = LEVEL_COLOR[p.accumulatedRiskLevel] ?? "#94a3b8";
  const localLabel = LEVEL_LABEL[p.localRiskLevel]   ?? String(p.localRiskLevel);
  const accumLabel = LEVEL_LABEL[p.accumulatedRiskLevel] ?? String(p.accumulatedRiskLevel);

  return `
    <div style="
      font-family: ui-monospace, monospace;
      background: #060d1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 12px;
      min-width: 210px;
      pointer-events: none;
    ">
      <p style="margin:0 0 8px;font-weight:600;color:#fff;font-size:13px">Segmento ${idx}</p>
      ${infoRow("Comuna",    commune)}
      ${infoRow("Distancia", formatDistanceKm(Number(p.distanceMeters)))}
      <div style="border-top:1px solid rgba(255,255,255,0.06);margin:8px 0 6px"></div>
      ${infoRow("Riesgo local",  `${dot(localColor)}<span style="color:${localColor}">${p.localRiskScore}/100 · ${localLabel}</span>`)}
      ${infoRow("Acumulado",     `${dot(accumColor)}<span style="color:${accumColor}">${p.accumulatedRiskScore}/100 · ${accumLabel}</span>`)}
    </div>`;
}
