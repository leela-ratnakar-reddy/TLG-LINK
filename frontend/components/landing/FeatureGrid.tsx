import React from "react";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  QrCode,
  Layers,
  Code2,
} from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: "Blazing Fast Redirects",
      description:
        "Engineered with FastAPI and an in-memory repository for sub-5ms HTTP 307 temporary redirects with low latency.",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-accent" />,
      title: "Real Analytics Only",
      description:
        "Every click is tracked from real user redirects with exact timestamps. No fabricated data, no simulated trends.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "Zero-SSRF Security",
      description:
        "Strict input validation rejecting malicious schemes (javascript:, data:, file:) without performing vulnerable outbound fetches.",
    },
    {
      icon: <QrCode className="w-5 h-5 text-primary" />,
      title: "Client-Side QR Codes",
      description:
        "Generate and download high-resolution QR codes directly in your browser for seamless print and mobile sharing.",
    },
    {
      icon: <Code2 className="w-5 h-5 text-accent" />,
      title: "Developer-First REST API",
      description:
        "Clean RESTful endpoints with interactive OpenAPI docs, Pydantic schemas, and automated Pytest test coverage.",
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      title: "PostgreSQL-Ready Architecture",
      description:
        "Decoupled repository design (BaseURLRepository) that allows seamless migration from in-memory to PostgreSQL in V2.",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 border-t border-subtle-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
            Engineered For Speed & Quality
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Everything you need in a modern URL shortener.
          </h3>
          <p className="text-sm sm:text-base text-muted mt-3">
            Built from the ground up as a production-quality SaaS portfolio project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-card bg-surface border border-subtle-border hover:border-hover-border transition-all duration-200 shadow-subtle group"
            >
              <div className="w-10 h-10 rounded-xl bg-elevated border border-subtle-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                {feature.icon}
              </div>
              <h4 className="text-base font-bold text-foreground mb-2">
                {feature.title}
              </h4>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
