import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightElement,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-muted select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-[#0B0F19] text-foreground border rounded-button py-2.5 text-sm transition-all duration-200 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon ? "pl-10" : "pl-3.5",
              rightElement ? "pr-20" : "pr-3.5",
              error
                ? "border-danger focus:ring-danger/30 focus:border-danger"
                : "border-subtle-border hover:border-hover-border",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2 flex items-center">{rightElement}</div>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger font-medium animate-fade-in">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-muted leading-relaxed">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
