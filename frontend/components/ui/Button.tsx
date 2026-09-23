import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-button active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5 min-w-[32px]",
      md: "text-sm px-4 py-2.5 h-10 gap-2 min-h-[40px] sm:min-h-[44px]",
      lg: "text-base px-6 py-3 h-12 gap-2.5 min-h-[48px]",
    };

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-primary-hover shadow-subtle hover:shadow-glow font-semibold",
      secondary:
        "bg-elevated text-foreground hover:bg-[#1E2638] border border-subtle-border hover:border-hover-border",
      outline:
        "bg-transparent text-foreground border border-subtle-border hover:border-hover-border hover:bg-surface",
      ghost:
        "bg-transparent text-muted hover:text-foreground hover:bg-surface/60",
      danger:
        "bg-danger/15 text-rose-300 border border-danger/30 hover:bg-danger hover:text-white hover:border-danger font-medium",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
