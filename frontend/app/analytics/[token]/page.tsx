"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LinkAnalytics } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { StatCard } from "@/components/analytics/StatCard";
import { ClicksTimelineChart } from "@/components/analytics/ClicksTimelineChart";
import { BreakdownCard } from "@/components/analytics/BreakdownCard";
import { QRModal } from "@/components/common/QRModal";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { formatDateTime, formatDate, truncateUrl } from "@/lib/utils";
import {
  Lock,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Trash2,
  MousePointerClick,
  Calendar,
  Clock,
  Smartphone,
  Globe2,
  Laptop,
  Compass,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function PrivateAnalyticsPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const router = useRouter();
  const toast = useToast();

  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLinkAnalytics(token);
      setAnalytics(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Private analytics not found. The token may be invalid or expired.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleCopyShortUrl = async () => {
    if (!analytics) return;
    try {
      await navigator.clipboard.writeText(analytics.short_url);
      setCopiedLink(true);
      toast.success("Short link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleOpenShortUrl = () => {
    if (!analytics) return;
    window.open(analytics.short_url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    try {
      await api.deleteLinkByToken(token);
      toast.success("Short link and its private analytics were permanently deleted.");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete link.");
      }
      throw err;
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // 2. Error / Not Found State
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-card bg-surface border border-subtle-border shadow-card flex flex-col items-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-5">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>

          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full mb-3">
            Access Denied
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Private Analytics Not Found
          </h1>

          <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
            This analytics link is invalid or no longer available. Make sure you possess the full private token.
          </p>

          <Link href="/" className="w-full">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to TLG LINK
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Loaded Private Analytics View
  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-subtle-border/60">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>TLG LINK</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono font-medium text-primary">
              <Lock className="w-3.5 h-3.5" />
              Private Analytics
            </span>
          </div>
        </div>

        {/* Link Banner Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-subtle-border shadow-card flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                Shortened URL
              </span>
              <h2 className="font-mono text-xl sm:text-2xl font-extrabold text-foreground truncate select-all">
                {analytics.short_url}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {analytics.is_expired ? (
                <Badge variant="expired" size="md">
                  Expired
                </Badge>
              ) : (
                <Badge variant="active" size="md">
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Original Destination URL */}
          <div className="p-3.5 rounded-xl bg-[#080B12] border border-subtle-border/60 font-mono text-xs sm:text-sm text-foreground/90 break-all select-all flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-muted/60 select-none mr-2 font-sans font-semibold text-xs">
                Destination:
              </span>
              <span>{analytics.original_url}</span>
            </div>
          </div>

          {/* Timestamps & Expiration */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDate(analytics.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Expires: {analytics.expires_at ? formatDate(analytics.expires_at) : "Never"}
            </span>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-subtle-border/60">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCopyShortUrl}
                leftIcon={
                  copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )
                }
              >
                {copiedLink ? "Copied ✓" : "Copy Short Link"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleOpenShortUrl}
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Open Link
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQrOpen(true)}
                leftIcon={<QrCode className="w-3.5 h-3.5" />}
              >
                QR Code
              </Button>
            </div>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Link
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clicks"
            value={analytics.total_clicks}
            icon={<MousePointerClick className="w-4 h-4 text-primary" />}
            description="All-time redirects logged"
          />
          <StatCard
            title="Today"
            value={analytics.clicks_today}
            icon={<Calendar className="w-4 h-4 text-accent" />}
            description="Redirects in the last 24h"
          />
          <StatCard
            title="Last 7 Days"
            value={analytics.clicks_7d}
            icon={<Clock className="w-4 h-4 text-emerald-400" />}
            description="Weekly redirect traffic"
          />
          <StatCard
            title="Last 30 Days"
            value={analytics.clicks_30d}
            icon={<Globe2 className="w-4 h-4 text-amber-400" />}
            description="Monthly redirect traffic"
          />
        </div>

        {/* Interactive Click Timeline Chart */}
        <ClicksTimelineChart timeline={analytics.timeline} />

        {/* Categorical Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BreakdownCard
            title="Devices"
            icon={<Smartphone className="w-4 h-4 text-primary" />}
            items={analytics.devices}
            emptyMessage="No device data yet"
          />
          <BreakdownCard
            title="Browsers"
            icon={<Compass className="w-4 h-4 text-accent" />}
            items={analytics.browsers}
            emptyMessage="No browser data yet"
          />
          <BreakdownCard
            title="Operating Systems"
            icon={<Laptop className="w-4 h-4 text-emerald-400" />}
            items={analytics.operating_systems}
            emptyMessage="No OS data yet"
          />
          <BreakdownCard
            title="Referrers"
            icon={<Globe2 className="w-4 h-4 text-amber-400" />}
            items={analytics.referrers}
            emptyMessage="No referrer data yet"
          />
        </div>

        {/* Recent Click Activity */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-subtle-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Recent Click Activity
            </h3>
            <span className="text-xs text-muted font-mono">
              Last {analytics.recent_activity.length} events
            </span>
          </div>

          {analytics.recent_activity.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted">
              No click events recorded yet. Share your short link to view incoming traffic.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-subtle-border/60 text-muted uppercase font-mono text-[10px]">
                    <th className="pb-2.5 font-semibold">Time (UTC)</th>
                    <th className="pb-2.5 font-semibold">Device</th>
                    <th className="pb-2.5 font-semibold">Browser</th>
                    <th className="pb-2.5 font-semibold">OS</th>
                    <th className="pb-2.5 font-semibold">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-border/30 font-medium">
                  {analytics.recent_activity.map((event, idx) => (
                    <tr key={idx} className="hover:bg-elevated/40 transition-colors">
                      <td className="py-2.5 font-mono text-muted text-[11px]">
                        {formatDateTime(event.timestamp)}
                      </td>
                      <td className="py-2.5 text-foreground">{event.device}</td>
                      <td className="py-2.5 text-foreground">{event.browser}</td>
                      <td className="py-2.5 text-foreground">{event.os}</td>
                      <td className="py-2.5 font-mono text-primary text-[11px] truncate max-w-[180px]">
                        {event.referrer || "Direct"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-elevated/40 border border-subtle-border/60 flex items-start gap-3 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacy Protection:</strong> TLG LINK never permanently stores raw IP addresses, never tracks users across links, and never builds user profiles. Only someone possessing this private analytics token can access these metrics.
          </p>
        </div>
      </div>

      {/* Modals */}
      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={analytics.short_url}
        originalUrl={analytics.original_url}
        shortCode={analytics.short_code}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        shortCode={analytics.short_code}
        onConfirm={handleDelete}
      />
    </div>
  );
}
