import React from "react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card bg-surface/60 border border-subtle-border border-dashed",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-elevated border border-subtle-border flex items-center justify-center text-primary mb-4 shadow-subtle">
        {icon || <Link2 className="w-6 h-6 text-muted" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
