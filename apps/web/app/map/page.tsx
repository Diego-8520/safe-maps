import type { Metadata } from "next";
import MapLayout from "@/components/map/map-layout";

export const metadata: Metadata = {
  title: "Mapa — Safe Maps",
  description: "Análisis de ruta urbana en Cali, Colombia.",
};

export default function MapPage() {
  return (
    <main className="h-svh w-full overflow-hidden">
      <MapLayout />
    </main>
  );
}
