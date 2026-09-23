import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "expired" | "neutral" | "primary" | "warning";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    active:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium",
    expired:
      "bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium",
    neutral:
      "bg-elevated text-muted border-subtle-border font-medium",
    primary:
      "bg-primary/10 text-primary border-primary/20 font-medium",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-mono select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
