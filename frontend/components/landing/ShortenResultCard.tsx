"use client";

import React, { useState } from "react";
import Link from "next/link";
import { URLItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { truncateUrl } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  RotateCcw,
  BarChart3,
  ShieldAlert,
  Lock,
} from "lucide-react";

export interface ShortenResultCardProps {
  item: URLItem;
  onReset: () => void;
  onOpenQR: (item: URLItem) => void;
}

export function ShortenResultCard({
  item,
  onReset,
  onOpenQR,
}: ShortenResultCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAnalytics, setCopiedAnalytics] = useState(false);
  const toast = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.short_url);
      setCopiedLink(true);
      toast.success("Short link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy short link.");
    }
  };

  const handleCopyAnalytics = async () => {
    try {
      await navigator.clipboard.writeText(item.analytics_url);
      setCopiedAnalytics(true);
      toast.success("Private analytics link copied to clipboard!");
      setTimeout(() => setCopiedAnalytics(false), 2000);
    } catch {
      toast.error("Failed to copy analytics link.");
    }
  };

  const handleOpen = () => {
    window.open(item.short_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-surface border border-primary/40 rounded-2xl p-6 sm:p-8 shadow-glow animate-fade-in space-y-6">
      {/* Success Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            URL shortened successfully
          </h3>
        </div>
        <Badge variant="active" size="sm">
          Active
        </Badge>
      </div>

      {/* Public Short Link Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#080B12] border border-subtle-border space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
          Your Short Link
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-mono text-base sm:text-lg font-bold text-primary select-all break-all">
            {item.short_url}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={
                copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
            >
              {copiedLink ? "Copied ✓" : "Copy"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpen}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenQR(item)}
              leftIcon={<QrCode className="w-3.5 h-3.5" />}
            >
              QR
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted truncate font-mono pt-1">
          <span className="text-muted/60">Resolves to:</span> {truncateUrl(item.original_url, 50)}
        </p>
      </div>

      {/* Private Analytics Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-elevated/70 border border-primary/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-bold text-foreground">
              Private analytics access
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
            Token Protected
          </span>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Access real-time click volume, devices, browsers, and referrers using your link&apos;s private secret.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/analytics/${item.analytics_token}`}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-accent hover:bg-accent/80 text-background font-semibold"
              leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
            >
              View Analytics
            </Button>
          </Link>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyAnalytics}
            leftIcon={
              copiedAnalytics ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          >
            {copiedAnalytics ? "Copied ✓" : "Copy Analytics Link"}
          </Button>
        </div>

        {/* Security / Privacy Warning */}
        <div className="p-3 rounded-lg bg-[#080B12] border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300/90 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Save your private analytics link.</strong> Anyone who possesses this private link can view analytics for this shortened URL. We do not store global link lists.
          </p>
        </div>
      </div>

      {/* Reset Action */}
      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-muted hover:text-foreground"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Shorten another URL
        </Button>
      </div>
    </div>
  );
}
