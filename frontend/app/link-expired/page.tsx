import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LinkExpiredPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-card bg-surface border border-subtle-border shadow-card flex flex-col items-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
          <Clock className="w-6 h-6 text-amber-400" />
        </div>

        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-3">
          410 Expired
        </span>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Link expired
        </h1>

        <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
          This short link is no longer active. The expiration date configured by the creator has passed.
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
