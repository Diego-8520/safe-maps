import type { EnrichedFeatureProperties } from "@/components/map/types";
import SidebarHeader from "./sidebar-header";
import RouteInputs from "./route-inputs";
import RouteSummary from "./route-summary";
import CommuneDetail from "./commune-detail";

export default function MapSidebar({ selected }: { selected: EnrichedFeatureProperties | null }) {
  return (
    <aside className="w-full md:w-80 md:shrink-0 flex flex-col bg-[#060d1a] border-r border-white/5 md:h-full overflow-y-auto">
      <SidebarHeader />
      <RouteInputs />
      <RouteSummary />
      <CommuneDetail selected={selected} />
    </aside>
  );
}
