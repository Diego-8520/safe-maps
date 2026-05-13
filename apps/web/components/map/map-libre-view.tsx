"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export type RiskLevel = "low" | "medium" | "high";

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

function isRiskLevel(v: unknown): v is RiskLevel {
  return v === "low" || v === "medium" || v === "high";
}

function buildPopupHtml(nombre: string, level: RiskLevel, score: number): string {
  const color = RISK_COLORS[level];
  const label = RISK_LABELS[level];
  return `
    <div style="
      font-family: ui-monospace, monospace;
      background: #060d1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 12px;
      min-width: 170px;
      pointer-events: none;
    ">
      <p style="margin:0 0 7px;font-weight:600;color:#fff;font-size:13px">${nombre}</p>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
        <span style="color:${color}">Riesgo: ${label}</span>
      </div>
      <p style="margin:0;color:#64748b;font-size:11px">
        Puntaje: <span style="color:#e2e8f0">${score}</span>/100
      </p>
    </div>`;
}

export default function MapLibreView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
          },
        ],
      },
      center: [-76.532, 3.4516],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
    });

    map.on("load", () => {
      if (!map.getSource("comunas-cali")) {
        map.addSource("comunas-cali", {
          type: "geojson",
          data: "/data/comunas-cali.geojson",
        });
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
            "line-width": 1.5,
          },
        });
      }

      map.on("mouseenter", "comunas-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mousemove", "comunas-fill", (e) => {
        if (!e.features?.length) return;

        const raw = e.features[0].properties;
        if (!raw) return;

        const level = isRiskLevel(raw.riskLevel) ? raw.riskLevel : "low";
        const nombre = typeof raw.nombre === "string" ? raw.nombre : "Comuna";
        const score = typeof raw.riskScore === "number" ? raw.riskScore : 0;

        popup.setLngLat(e.lngLat).setHTML(buildPopupHtml(nombre, level, score)).addTo(map);
      });

      map.on("mouseleave", "comunas-fill", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
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
