import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-elevated/80", className)}
      {...props}
    />
  );
}

export function URLCardSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-card bg-surface border border-subtle-border space-y-3.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2 border-t border-subtle-border/60">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-card bg-surface border border-subtle-border space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
