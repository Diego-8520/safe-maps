"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { EnrichedFeatureProperties } from "./types";
import type { RouteAnalysis } from "./routes/route-types";
import { normalizeCommuneProperties } from "./data/load-communes";
import { buildCommunePopupHtml } from "./popups/commune-popup";
import { buildRouteSegmentPopupHtml } from "./popups/route-segment-popup";
import type { RouteSegmentPopupProps } from "./popups/route-segment-popup";
import { buildRouteGeoJson } from "./routes/route-utils";

interface MapLibreViewProps {
  onCommuneSelect?: (id: number) => void;
  route?: RouteAnalysis | null;
  communesGeojson: GeoJSON.FeatureCollection | null;
}

export default function MapLibreView({ onCommuneSelect, route, communesGeojson }: MapLibreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onCommuneSelect);
  const routePopupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    onSelectRef.current = onCommuneSelect;
  }, [onCommuneSelect]);

  // Map initialization — runs once, wires up event handlers
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

    const communePopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "300px",
    });

    routePopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
    });

    map.on("load", () => {
      // --- Commune hover/click handlers ---
      // Registered once on map load. MapLibre returns empty features if
      // "comunas-fill" doesn't exist yet, so the !e.features?.length guards
      // below keep handlers safe until the communes effect adds the layer.

      map.on("mouseenter", "comunas-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mousemove", "comunas-fill", (e) => {
        if (!e.features?.length) return;
        const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
        if (!raw?.nombre) return;
        communePopup.setLngLat(e.lngLat).setHTML(buildCommunePopupHtml(normalizeCommuneProperties(raw))).addTo(map);
      });

      map.on("mouseleave", "comunas-fill", () => {
        map.getCanvas().style.cursor = "";
        communePopup.remove();
      });

      map.on("click", "comunas-fill", (e) => {
        if (!e.features?.length) return;
        const raw = e.features[0].properties as Partial<EnrichedFeatureProperties>;
        const communeId = raw.comuna ?? 0;
        map.setFilter("selected-commune-outline", [
          "==",
          ["get", "comuna"],
          communeId,
        ]);
        // Pass only the ID — parent derives full properties from communesGeojson state.
        onSelectRef.current?.(communeId);
      });

      // --- Route segment hover handlers ---
      // Suppresses the commune popup while hovering the route.
      map.on("mouseenter", "route-line", () => {
        map.getCanvas().style.cursor = "pointer";
        communePopup.remove();
      });

      map.on("mousemove", "route-line", (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as RouteSegmentPopupProps;
        routePopupRef.current
          ?.setLngLat(e.lngLat)
          .setHTML(buildRouteSegmentPopupHtml(p))
          .addTo(map);
      });

      map.on("mouseleave", "route-line", () => {
        map.getCanvas().style.cursor = "";
        routePopupRef.current?.remove();
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Communes source and layers — reactive to communesGeojson prop.
  // Updates the MapLibre source whenever the enriched GeoJSON from the
  // parent changes, keeping the map fill colors and properties in sync.
  useEffect(() => {
    if (!communesGeojson) return;
    const map = mapRef.current;
    if (!map) return;

    function applyCommunes() {
      if (!map || !communesGeojson) return;

      if (map.getSource("comunas-cali")) {
        (map.getSource("comunas-cali") as maplibregl.GeoJSONSource).setData(communesGeojson);
      } else {
        map.addSource("comunas-cali", { type: "geojson", data: communesGeojson });
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

      // route-line is inserted before this layer when route is set.
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
    }

    if (map.isStyleLoaded()) {
      applyCommunes();
    } else {
      map.once("load", applyCommunes);
    }
  }, [communesGeojson]);

  // Route layer — reactive to route prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function applyRoute() {
      if (!map) return;

      if (!route) {
        if (map.getLayer("route-line")) map.removeLayer("route-line");
        if (map.getSource("route")) map.removeSource("route");
        return;
      }

      const geojson = buildRouteGeoJson(route);

      if (map.getSource("route")) {
        (map.getSource("route") as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource("route", { type: "geojson", data: geojson });
      }

      if (!map.getLayer("route-line")) {
        // Insert before selected-commune-outline so highlight stays on top
        const beforeId = map.getLayer("selected-commune-outline")
          ? "selected-commune-outline"
          : undefined;

        map.addLayer(
          {
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": [
                "match",
                ["get", "localRiskLevel"],
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
          },
          beforeId,
        );
      }
    }

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once("load", applyRoute);
    }
  }, [route]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
