"use client";

import React, { useMemo, useState } from "react";
import { TimelinePoint } from "@/types";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartFilter = "24h" | "7d" | "30d" | "all";

export interface ClicksTimelineChartProps {
  timeline: TimelinePoint[];
}

export function ClicksTimelineChart({ timeline }: ClicksTimelineChartProps) {
  const [activeFilter, setActiveFilter] = useState<ChartFilter>("all");

  const filteredData = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    const now = new Date();
    if (activeFilter === "24h") {
      // Last 24 hours: latest 1-2 points or filter by date
      const todayStr = now.toISOString().slice(0, 10);
      const filtered = timeline.filter((p) => p.date >= todayStr);
      return filtered.length > 0 ? filtered : timeline.slice(-1);
    } else if (activeFilter === "7d") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return timeline.filter((p) => p.date >= cutoffStr);
    } else if (activeFilter === "30d") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return timeline.filter((p) => p.date >= cutoffStr);
    }
    return timeline;
  }, [timeline, activeFilter]);

  if (!timeline || timeline.length === 0 || timeline.every((d) => d.clicks === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card bg-surface border border-subtle-border">
        <div className="w-12 h-12 rounded-xl bg-elevated border border-subtle-border flex items-center justify-center text-primary mb-3">
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <h4 className="text-base font-semibold text-foreground mb-1">
          No analytics yet
        </h4>
        <p className="text-xs sm:text-sm text-muted max-w-sm">
          Analytics will appear here once your link receives clicks.
        </p>
      </div>
    );
  }

  const maxClicks = Math.max(...(filteredData.length > 0 ? filteredData.map((d) => d.clicks) : [1]), 1);

  return (
    <div className="p-5 sm:p-6 rounded-card bg-surface border border-subtle-border shadow-subtle space-y-4">
      {/* Chart Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Clicks Over Time
          </h3>
          <p className="text-xs text-muted">
            Daily redirected click volume for this private link
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-lg border border-subtle-border self-start sm:self-auto">
          {(
            [
              { id: "24h", label: "24 Hours" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" },
            ] as { id: ChartFilter; label: string }[]
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-white font-semibold"
                  : "text-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full overflow-x-auto pt-2">
        <div className="min-w-[320px]">
          {filteredData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-muted">
              No clicks recorded in this timeframe.
            </div>
          ) : (
            <div className="h-44 flex items-end gap-2 sm:gap-3 px-2 pt-4 border-b border-subtle-border/60">
              {filteredData.map((point) => {
                const heightPercent = Math.max(
                  Math.round((point.clicks / maxClicks) * 100),
                  10
                );

                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <span className="text-[11px] font-mono font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-elevated px-2 py-0.5 rounded border border-subtle-border shadow-subtle pointer-events-none whitespace-nowrap">
                      {point.clicks} {point.clicks === 1 ? "click" : "clicks"}
                    </span>

                    {/* Bar with gradient */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-primary/30 to-primary group-hover:from-primary/60 group-hover:to-accent transition-all duration-200 border-t border-x border-primary/50"
                    />

                    {/* Date label */}
                    <span className="text-[10px] sm:text-xs text-muted font-mono truncate max-w-full">
                      {point.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
