import type { EnrichedFeatureProperties } from "@/components/map/types";
import { getRiskColor, getRiskLevelLabel } from "@/components/map/risk-utils";

export function buildCommunePopupHtml(p: EnrichedFeatureProperties): string {
  const color = getRiskColor(p.riskLevel);
  const label = getRiskLevelLabel(p.riskLevel);
  const displayName = p.nombre ?? `Comuna ${p.comuna}`;
  return `
    <div style="
      font-family: ui-monospace, monospace;
      background: #060d1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 12px;
      min-width: 190px;
      pointer-events: none;
    ">
      <p style="margin:0 0 8px;font-weight:600;color:#fff;font-size:13px">${displayName}</p>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
        <span style="color:${color};font-size:12px">Riesgo: ${label} · ${p.riskScore}/100</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;color:#94a3b8;font-size:11px">
        <span>Criminalidad</span><span style="color:#e2e8f0;text-align:right">${p.criminalidad}</span>
        <span>Seguridad</span><span style="color:#e2e8f0;text-align:right">${p.seguridad}</span>
        <span>Vigilancia</span><span style="color:#e2e8f0;text-align:right">${p.vigilancia}</span>
        <span>Iluminación</span><span style="color:#e2e8f0;text-align:right">${p.iluminacion}</span>
        <span>Flujo personas</span><span style="color:#e2e8f0;text-align:right">${p.flujoPersonas}</span>
      </div>
      <p style="margin:6px 0 0;color:#475569;font-size:10px">Clic para seleccionar</p>
    </div>`;
}
