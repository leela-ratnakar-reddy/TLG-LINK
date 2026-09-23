import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LinkNotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-card bg-surface border border-subtle-border shadow-card flex flex-col items-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-5">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>

        <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full mb-3">
          404 Not Found
        </span>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Link not found
        </h1>

        <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
          This short link doesn&apos;t exist or may have been removed.
        </p>

        <Link href="/" className="w-full">
          <Button variant="primary" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Go to TLG LINK
          </Button>
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted">
        <Link2 className="w-3.5 h-3.5 text-primary" />
        <span>TLG LINK — Short links. Smart analytics.</span>
      </div>
    </div>
  );
}
