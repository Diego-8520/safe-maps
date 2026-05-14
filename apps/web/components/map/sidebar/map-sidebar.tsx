import type { EnrichedFeatureProperties } from "@/components/map/types";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import SidebarHeader from "./sidebar-header";
import RouteInputs from "./route-inputs";
import RouteSummary from "./route-summary";
import RouteSegmentsPanel from "./route-segments-panel";
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
      />
      <RouteSummary route={route} />
      <RouteSegmentsPanel route={route} />
      <CommuneDetail selected={selected} />
    </aside>
  );
}
