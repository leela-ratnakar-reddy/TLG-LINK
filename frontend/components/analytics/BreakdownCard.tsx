import React from "react";
import { CategoryBreakdown } from "@/types";
import { cn } from "@/lib/utils";

export interface BreakdownCardProps {
  title: string;
  icon: React.ReactNode;
  items: CategoryBreakdown[];
  emptyMessage?: string;
  className?: string;
}

export function BreakdownCard({
  title,
  icon,
  items,
  emptyMessage = "No data yet",
  className,
}: BreakdownCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-card bg-surface border border-subtle-border shadow-subtle flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-subtle-border/60">
        <div className="w-7 h-7 rounded-lg bg-elevated border border-subtle-border flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
          {title}
        </h4>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {items.length === 0 ? (
          <p className="text-xs text-muted/60 text-center py-4">{emptyMessage}</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {item.label}
                </span>
                <span className="font-mono text-muted text-[11px]">
                  <strong className="text-foreground">{item.percentage}%</strong> ({item.count})
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-[#080B12] rounded-full overflow-hidden border border-subtle-border/40">
                <div
                  style={{ width: `${Math.min(Math.max(item.percentage, 3), 100)}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
