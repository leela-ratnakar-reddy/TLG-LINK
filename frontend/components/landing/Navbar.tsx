"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, Menu, X, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const handleOpenAnalytics = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = tokenInput.trim();
    if (!raw) {
      setTokenError("Please enter your private analytics link or token.");
      return;
    }

    // Extract token if user pasted full URL (e.g. https://.../analytics/<token>)
    const tokenMatch = raw.match(/\/analytics\/([a-zA-Z0-9_-]+)/);
    const token = tokenMatch ? tokenMatch[1] : raw;

    if (token.length < 10) {
      setTokenError("Invalid token format. Please paste your full token or link.");
      return;
    }

    setTokenError(null);
    setAnalyticsModalOpen(false);
    setTokenInput("");
    router.push(`/analytics/${token}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-subtle-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                TLG LINK
              </span>
              <span className="text-[10px] text-muted font-medium tracking-wide">
                Short links. Smart analytics.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Shorten
            </Link>
            <button
              type="button"
              onClick={() => setAnalyticsModalOpen(true)}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-accent" />
              <span>Analytics</span>
            </button>
            <a
              href="#about"
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop Direct Analytics Trigger */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnalyticsModalOpen(true)}
              className="text-xs border-primary/30 hover:border-primary/60 text-foreground"
              leftIcon={<Lock className="w-3.5 h-3.5 text-accent" />}
            >
              Access Analytics
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-subtle-border bg-surface px-4 py-5 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-1.5"
              >
                Shorten
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAnalyticsModalOpen(true);
                }}
                className="text-muted hover:text-foreground transition-colors py-1.5 text-left flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-accent" />
                <span>Analytics</span>
              </button>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted hover:text-foreground transition-colors py-1.5"
              >
                About
              </a>
            </nav>

            <div className="pt-2 border-t border-subtle-border">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAnalyticsModalOpen(true);
                }}
                className="w-full justify-center text-xs"
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Access Private Analytics
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Access Private Analytics Modal */}
      <Modal
        isOpen={analyticsModalOpen}
        onClose={() => {
          setAnalyticsModalOpen(false);
          setTokenError(null);
        }}
        title="Access Private Analytics"
        description="Enter your link's private analytics secret or paste the full analytics link to inspect its metrics."
        maxWidth="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalyticsModalOpen(false);
                setTokenError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenAnalytics}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Analytics
            </Button>
          </>
        }
      >
        <form onSubmit={handleOpenAnalytics} className="space-y-4">
          <Input
            label="Private Analytics Link or Token"
            placeholder="Paste your link (e.g. https://.../analytics/... or token)"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              if (tokenError) setTokenError(null);
            }}
            error={tokenError}
            leftIcon={<Lock className="w-4 h-4 text-muted" />}
            autoFocus
          />

          <p className="text-xs text-muted leading-relaxed">
            TLG LINK is privacy-first. There is no global list of links. Only holders of this private token can access this link&apos;s click performance.
          </p>
        </form>
      </Modal>
    </>
  );
}
