"use client";

import { useState } from "react";
import type { RouteAnalysis, RouteRiskLevel } from "@/components/map/routes/route-types";
import { formatDistanceKm } from "@/components/map/routes/route-utils";

const PAGE_SIZE = 8;

const LEVEL_DOT: Record<RouteRiskLevel, string> = {
  low:    "bg-emerald-400",
  medium: "bg-amber-400",
  high:   "bg-red-500",
};

const LEVEL_TEXT: Record<RouteRiskLevel, string> = {
  low:    "text-emerald-400",
  medium: "text-amber-400",
  high:   "text-red-400",
};

function ScoreCell({ score, level }: { score: number; level: RouteRiskLevel }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[level]}`} />
      <span className={`text-[10px] font-mono ${LEVEL_TEXT[level]}`}>{score}</span>
    </div>
  );
}

export default function RouteSegmentsPanel({ route }: { route: RouteAnalysis | null }) {
  const segmentCount = route?.segments.length ?? 0;
  const [page, setPage] = useState(0);
  const [prevSegmentCount, setPrevSegmentCount] = useState(segmentCount);

  if (prevSegmentCount !== segmentCount) {
    setPrevSegmentCount(segmentCount);
    setPage(0);
  }

  if (!route || route.segments.length === 0) return null;

  const { segments } = route;
  const totalPages = Math.ceil(segments.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, segments.length);
  const displayed = segments.slice(start, end);
  const hasPagination = segments.length > PAGE_SIZE;

  return (
    <div className="px-5 py-5 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Evolución por segmentos
        </p>
        {hasPagination && (
          <span className="text-[10px] font-mono text-slate-600">
            {start + 1}–{end} / {segments.length}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_3rem_2.25rem_auto_auto] gap-x-2 px-2 mb-1.5">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">#</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">dist</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">com</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">local</span>
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">acum.</span>
      </div>

      <div className="space-y-1">
        {displayed.map((seg, i) => (
          <div
            key={seg.id}
            className="grid grid-cols-[1.5rem_3rem_2.25rem_auto_auto] gap-x-2 items-center px-2 py-1.5 rounded-lg bg-white/3 border border-white/6"
          >
            <span className="text-[10px] font-mono text-slate-600">
              {String(start + i + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {formatDistanceKm(seg.distanceMeters)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {seg.communeId !== null ? `C${seg.communeId}` : "–"}
            </span>
            <ScoreCell score={seg.localRiskScore} level={seg.localRiskLevel} />
            <ScoreCell score={seg.accumulatedRiskScore} level={seg.accumulatedRiskLevel} />
          </div>
        ))}
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed px-1.5 py-0.5"
          >
            ‹
          </button>
          <span className="text-[10px] font-mono text-slate-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed px-1.5 py-0.5"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
