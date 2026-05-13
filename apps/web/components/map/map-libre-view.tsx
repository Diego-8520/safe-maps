"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { CommuneRiskData, EnrichedFeatureProperties } from "./types";
import { getRiskColor, getRiskLevelLabel, isRiskLevel } from "./risk-utils";

interface MapLibreViewProps {
  onCommuneSelect?: (commune: EnrichedFeatureProperties) => void;
}

const RISK_FALLBACK: Omit<CommuneRiskData, "comuna"> = {
  riskScore: 0,
  riskLevel: "low",
  criminalidad: 0,
  seguridad: 0,
  vigilancia: 0,
  iluminacion: 0,
  flujoPersonas: 0,
};

function buildPopupHtml(p: EnrichedFeatureProperties): string {
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

async function loadEnrichedGeojson(): Promise<GeoJSON.FeatureCollection> {
  const [geojsonRes, riskRes] = await Promise.all([
    fetch("/data/comunas-cali.geojson"),
    fetch("/data/comunas-risk.json"),
  ]);

  if (!geojsonRes.ok) throw new Error(`GeoJSON fetch failed: ${geojsonRes.status}`);
  if (!riskRes.ok) throw new Error(`Risk data fetch failed: ${riskRes.status}`);

  const geojson = (await geojsonRes.json()) as GeoJSON.FeatureCollection;
  const riskList = (await riskRes.json()) as CommuneRiskData[];

  const riskMap = new Map<number, CommuneRiskData>(
    riskList.map((r) => [r.comuna, r])
  );

  return {
    ...geojson,
    features: geojson.features.map((feature) => {
      const props = feature.properties as {
        comuna: number;
        nombre: string;
        shape_leng?: number;
        shape_area?: number;
      };
      const risk = riskMap.get(props.comuna) ?? { comuna: props.comuna, ...RISK_FALLBACK };
      return { ...feature, properties: { ...props, ...risk } satisfies EnrichedFeatureProperties };
    }),
  };
}

function normalizeProps(raw: Partial<EnrichedFeatureProperties>): EnrichedFeatureProperties {
  const level = isRiskLevel(raw.riskLevel) ? raw.riskLevel : "low";
  return {
    comuna:        raw.comuna        ?? 0,
    nombre:        raw.nombre        ?? "Comuna",
    shape_leng:    raw.shape_leng,
    shape_area:    raw.shape_area,
    riskScore:     raw.riskScore     ?? 0,
    riskLevel:     level,
    criminalidad:  raw.criminalidad  ?? 0,
    seguridad:     raw.seguridad     ?? 0,
    vigilancia:    raw.vigilancia    ?? 0,
    iluminacion:   raw.iluminacion   ?? 0,
    flujoPersonas: raw.flujoPersonas ?? 0,
  };
}

export default function MapLibreView({ onCommuneSelect }: MapLibreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onCommuneSelect);

  useEffect(() => {
    onSelectRef.current = onCommuneSelect;
  }, [onCommuneSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm-tiles", type: "raster", source: "osm-tiles" }],
      },
      center: [-76.532, 3.4516],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "300px",
    });

    map.on("load", () => {
      loadEnrichedGeojson()
        .then((enriched) => {
          if (!map.getSource("comunas-cali")) {
            map.addSource("comunas-cali", { type: "geojson", data: enriched });
          }

          if (!map.getLayer("comunas-fill")) {
            map.addLayer({
              id: "comunas-fill",
              type: "fill",
              source: "comunas-cali",
              paint: {
                "fill-color": [
                  "match",
                  ["get", "riskLevel"],
                  "low",    "#22c55e",
                  "medium", "#f59e0b",
                  "high",   "#ef4444",
                  "#334155",
                ],
                "fill-opacity": 0.45,
              },
            });
          }

          if (!map.getLayer("comunas-outline")) {
            map.addLayer({
              id: "comunas-outline",
              type: "line",
              source: "comunas-cali",
              paint: {
                "line-color": "#0f172a",
                "line-width": [
                  "interpolate", ["linear"], ["zoom"],
                  10, 0.4,
                  12, 0.8,
                  14, 1.5,
                ],
              },
            });
          }

          if (!map.getLayer("selected-commune-outline")) {
            map.addLayer({
              id: "selected-commune-outline",
              type: "line",
              source: "comunas-cali",
              paint: {
                "line-color": "#ffffff",
                "line-width": 2.5,
                "line-opacity": 0.85,
              },
              filter: ["==", ["get", "comuna"], -1],
            });
          }

          map.on("mouseenter", "comunas-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mousemove", "comunas-fill", (e) => {
            if (!e.features?.length) return;
            const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
            if (!raw?.nombre) return;
            popup.setLngLat(e.lngLat).setHTML(buildPopupHtml(normalizeProps(raw))).addTo(map);
          });

          map.on("mouseleave", "comunas-fill", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });

          map.on("click", "comunas-fill", (e) => {
            if (!e.features?.length) return;
            const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
            const props = normalizeProps(raw);
            map.setFilter("selected-commune-outline", [
              "==",
              ["get", "comuna"],
              props.comuna,
            ]);
            onSelectRef.current?.(props);
          });
        })
        .catch((err) => {
          console.error("[MapLibreView] Failed to load commune data:", err);
        });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
