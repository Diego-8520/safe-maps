"use client";

import { useState } from "react";
import RouteSummary from "@/components/map/sidebar/route-summary";
import RouteSegmentsPanel from "@/components/map/sidebar/route-segments-panel";
import CommuneDetail from "@/components/map/sidebar/commune-detail";
import type { RouteAnalysis } from "@/components/map/routes/route-types";
import type { EnrichedFeatureProperties } from "@/components/map/types";

type SheetState = "collapsed" | "half" | "full";

const SHEET_HEIGHT: Record<SheetState, string> = {
  collapsed: "h-14",
  half:      "h-[48vh]",
  full:      "h-[85vh]",
};

const NEXT_STATE: Record<SheetState, SheetState> = {
  collapsed: "half",
  half:      "full",
  full:      "collapsed",
};

const HANDLE_LABEL: Record<SheetState, string> = {
  collapsed: "Expandir",
  half:      "Ver más",
  full:      "Contraer",
};

interface MobileBottomSheetProps {
  route: RouteAnalysis | null;
  selected: EnrichedFeatureProperties | null;
}

export default function MobileBottomSheet({ route, selected }: MobileBottomSheetProps) {
  const [state, setState] = useState<SheetState>("collapsed");

  const hasContent = route !== null || selected !== null;

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0 z-30
        bg-[#060d1a]/95 backdrop-blur-md
        border-t border-white/8 rounded-t-2xl
        flex flex-col
        transition-[height] duration-300 ease-in-out
        ${SHEET_HEIGHT[state]}
      `}
    >
      {/* Drag handle — tap to cycle states */}
      <button
        type="button"
        onClick={() => setState(NEXT_STATE[state])}
        aria-label={HANDLE_LABEL[state]}
        className="w-full flex flex-col items-center gap-1.5 pt-3 pb-2 shrink-0 touch-manipulation select-none"
      >
        <div className="w-10 h-1 rounded-full bg-white/20" />
        {state === "collapsed" && (
          <p className="text-[10px] font-mono text-slate-500">
            {hasContent ? "Ver análisis de ruta" : "Ver detalles"}
          </p>
        )}
      </button>

      {/* Scrollable content — hidden when collapsed */}
      {state !== "collapsed" && (
        <div className="flex-1 overflow-y-auto pb-6">
          <RouteSummary route={route} />
          <RouteSegmentsPanel route={route} />
          <CommuneDetail selected={selected} />
        </div>
      )}
    </div>
  );
}
