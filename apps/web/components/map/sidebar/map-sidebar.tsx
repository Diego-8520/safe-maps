import type { EnrichedFeatureProperties } from "@/components/map/types";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import SidebarHeader from "./sidebar-header";
import RouteInputs from "./route-inputs";
import RouteSummary from "./route-summary";
import CommuneDetail from "./commune-detail";

interface MapSidebarProps {
  selected: EnrichedFeatureProperties | null;
  route: RouteAnalysis | null;
  onAnalyzeRoute: () => void;
}

export default function MapSidebar({ selected, route, onAnalyzeRoute }: MapSidebarProps) {
  return (
    <aside className="w-full md:w-80 md:shrink-0 flex flex-col bg-[#060d1a] border-r border-white/5 md:h-full overflow-y-auto">
      <SidebarHeader />
      <RouteInputs onAnalyzeRoute={onAnalyzeRoute} />
      <RouteSummary route={route} />
      <CommuneDetail selected={selected} />
    </aside>
  );
}
