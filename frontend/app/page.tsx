"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Footer } from "@/components/landing/Footer";
import { QRModal } from "@/components/common/QRModal";
import { URLItem } from "@/types";
import { Terminal, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function LandingPage() {
  const [qrItem, setQrItem] = useState<URLItem | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const toast = useToast();

  const curlCommand = `curl -X POST http://localhost:8000/api/v1/urls \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://github.com/fastapi/fastapi"}'`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      toast.success("Curl command copied to clipboard!");
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      toast.error("Failed to copy command.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with interactive shortener */}
        <HeroSection onOpenQR={(item) => setQrItem(item)} />

        {/* Feature Grid */}
        <FeatureGrid />

        {/* Interactive Developer API Section */}
        <section id="api" className="py-16 sm:py-24 border-t border-subtle-border/60 bg-[#06080E]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Developer First
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                Simple, RESTful, and fast.
              </h3>
              <p className="text-xs sm:text-sm text-muted mt-2 max-w-lg mx-auto">
                Integrate TLG LINK into your scripts, CI pipelines, and apps with standard JSON payloads.
              </p>
            </div>

            {/* Terminal snippet card */}
            <div className="rounded-2xl bg-[#090D17] border border-subtle-border shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-elevated/40 border-b border-subtle-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-muted ml-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    bash — curl request
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground px-2.5 py-1 rounded bg-elevated border border-subtle-border transition-colors"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono text-foreground/90 leading-relaxed">
                <pre>{curlCommand}</pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* QR Modal */}
      <QRModal
        isOpen={!!qrItem}
        onClose={() => setQrItem(null)}
        shortUrl={qrItem?.short_url || null}
        originalUrl={qrItem?.original_url}
        shortCode={qrItem?.short_code}
      />
    </div>
  );
}
