import React from "react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trendBadge?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trendBadge,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-card bg-surface border border-subtle-border hover:border-hover-border transition-all duration-200 shadow-subtle flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-elevated border border-subtle-border flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {formatNumber(value)}
          </span>
          {trendBadge && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              {trendBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted mt-1 leading-normal">{description}</p>
      </div>
    </div>
  );
}
