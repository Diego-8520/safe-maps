"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { EnrichedFeatureProperties } from "./types";
import type { RouteAnalysis } from "./routes/route-types";
import { loadEnrichedGeojson, normalizeCommuneProperties } from "./data/load-communes";
import { buildCommunePopupHtml } from "./popups/commune-popup";
import { buildRouteGeoJson } from "./routes/route-utils";

interface MapLibreViewProps {
  onCommuneSelect?: (commune: EnrichedFeatureProperties) => void;
  route?: RouteAnalysis;
}

export default function MapLibreView({ onCommuneSelect, route }: MapLibreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onCommuneSelect);
  const routeRef = useRef(route);

  useEffect(() => {
    onSelectRef.current = onCommuneSelect;
  }, [onCommuneSelect]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

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
          // --- Layer 1: comunas-fill ---
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

          // --- Layer 2: comunas-outline ---
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

          // --- Layer 3: demo-route-line (above communes, below selected outline) ---
          if (routeRef.current && !map.getSource("demo-route")) {
            map.addSource("demo-route", {
              type: "geojson",
              data: buildRouteGeoJson(routeRef.current),
            });
            map.addLayer({
              id: "demo-route-line",
              type: "line",
              source: "demo-route",
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
              paint: {
                "line-color": [
                  "match",
                  ["get", "accumulatedRiskLevel"],
                  "low",    "#22c55e",
                  "medium", "#f59e0b",
                  "high",   "#ef4444",
                  "#38bdf8",
                ],
                "line-width": [
                  "interpolate", ["linear"], ["zoom"],
                  10, 3,
                  12, 5,
                  14, 7,
                ],
                "line-opacity": 0.95,
              },
            });
          }

          // --- Layer 4: selected-commune-outline (always on top) ---
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

          // --- Events ---
          map.on("mouseenter", "comunas-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mousemove", "comunas-fill", (e) => {
            if (!e.features?.length) return;
            const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
            if (!raw?.nombre) return;
            popup.setLngLat(e.lngLat).setHTML(buildCommunePopupHtml(normalizeCommuneProperties(raw))).addTo(map);
          });

          map.on("mouseleave", "comunas-fill", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });

          map.on("click", "comunas-fill", (e) => {
            if (!e.features?.length) return;
            const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
            const props = normalizeCommuneProperties(raw);
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
