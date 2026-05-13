import type { EnrichedFeatureProperties } from "@/components/map/types";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import SidebarHeader from "./sidebar-header";
import RouteInputs from "./route-inputs";
import RouteSummary from "./route-summary";
import CommuneDetail from "./commune-detail";

interface MapSidebarProps {
  selected: EnrichedFeatureProperties | null;
  route: RouteAnalysis | null;
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAnalyzeRoute: () => void;
  routeError: string | null;
  isAnalyzingRoute: boolean;
  routeMode: "demo" | "real";
  onRouteModeChange: (mode: "demo" | "real") => void;
}

export default function MapSidebar({
  selected,
  route,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAnalyzeRoute,
  routeError,
  isAnalyzingRoute,
  routeMode,
  onRouteModeChange,
}: MapSidebarProps) {
  return (
    <aside className="w-full md:w-80 md:shrink-0 flex flex-col bg-[#060d1a] border-r border-white/5 md:h-full overflow-y-auto">
      <SidebarHeader />
      <RouteInputs
        origin={origin}
        destination={destination}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
        onAnalyzeRoute={onAnalyzeRoute}
        routeError={routeError}
        isAnalyzingRoute={isAnalyzingRoute}
        routeMode={routeMode}
        onRouteModeChange={onRouteModeChange}
      />
      <RouteSummary route={route} />
      <CommuneDetail selected={selected} />
    </aside>
  );
}
