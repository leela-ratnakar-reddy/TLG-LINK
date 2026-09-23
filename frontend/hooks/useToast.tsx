"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastMessage, ToastType } from "@/types";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => showToast(msg, "success", dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, "error", dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, "info", dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, "warning", dur), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        role="region"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-card transition-all duration-300 animate-fade-in backdrop-blur-md",
                isSuccess && "bg-[#0F1A1C]/90 border-emerald-500/30 text-emerald-100",
                isError && "bg-[#1E1114]/90 border-rose-500/30 text-rose-100",
                isWarning && "bg-[#1C160F]/90 border-amber-500/30 text-amber-100",
                toast.type === "info" && "bg-surface/95 border-subtle-border text-foreground"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-primary" />}
              </div>

              <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-muted hover:text-foreground p-0.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
