import React from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="border-t border-subtle-border/60 bg-[#06080E] py-12 text-muted text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-subtle">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-foreground tracking-tight text-sm">
              TLG LINK
            </span>
            <span className="block text-[11px] text-muted">
              Short links. Smart analytics.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Shorten
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            API Docs
          </a>
        </div>

        <p className="text-[11px] text-muted/80">
          Privacy-First Architecture • Zero Raw IP Logging • Open Portfolio Project
        </p>
      </div>
    </footer>
  );
}
