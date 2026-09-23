"use client";

import React, { useState } from "react";
import { URLItem } from "@/types";
import { validateUrl } from "@/lib/validators";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { ShortenResultCard } from "@/components/landing/ShortenResultCard";
import { Button } from "@/components/ui/Button";
import { Link2, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export interface HeroSectionProps {
  onOpenQR: (item: URLItem) => void;
  onLinkCreated?: (item: URLItem) => void;
}

export function HeroSection({ onOpenQR, onLinkCreated }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdItem, setCreatedItem] = useState<URLItem | null>(null);
  const toast = useToast();

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const item = await api.createUrl({ url: url.trim() });
      setCreatedItem(item);
      toast.success("Short link created successfully!");
      if (onLinkCreated) {
        onLinkCreated(item);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("Failed to create short link. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Small badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-elevated/80 border border-subtle-border mb-6 shadow-subtle animate-fade-in">
          <span className="text-xs font-medium text-foreground tracking-wide flex items-center gap-1.5">
            ⚡ Fast • Simple • Developer Friendly
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-6">
          Turn long URLs into{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            powerful short links.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Create clean, shareable links in seconds and track how they perform.
        </p>

        {/* Main interactive shortening card or Result card */}
        <div className="max-w-2xl mx-auto">
          {createdItem ? (
            <ShortenResultCard
              item={createdItem}
              onReset={() => {
                setCreatedItem(null);
                setUrl("");
              }}
              onOpenQR={onOpenQR}
            />
          ) : (
            <div className="p-5 sm:p-7 rounded-2xl bg-surface border border-subtle-border hover:border-hover-border transition-all duration-300 shadow-card text-left">
              <form onSubmit={handleShorten} className="space-y-4">
                <div>
                  <label
                    htmlFor="hero-url-input"
                    className="text-xs font-bold uppercase tracking-wider text-muted block mb-2"
                  >
                    Paste your long URL
                  </label>

                  <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                    <div className="relative flex-1">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                        <Link2 className="w-5 h-5" />
                      </div>
                      <input
                        id="hero-url-input"
                        type="text"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="https://example.com/your-long-url"
                        className={`w-full bg-[#080B12] text-foreground border rounded-xl sm:rounded-r-none py-3.5 pl-11 pr-4 text-sm sm:text-base transition-all duration-200 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                          error ? "border-danger focus:ring-danger/30" : "border-subtle-border"
                        }`}
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="rounded-xl sm:rounded-l-none sm:border-l-0 px-6 sm:h-[50px] shrink-0 font-semibold"
                    >
                      {isLoading ? "Creating your short link..." : "Shorten URL"}
                    </Button>
                  </div>

                  {error && (
                    <p className="text-xs text-danger font-medium mt-2 animate-fade-in">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-muted pt-2 border-t border-subtle-border/40 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Strict URL Validation
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      Sub-millisecond routing
                    </span>
                  </div>
                  <span>No login required</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
