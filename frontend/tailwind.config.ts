import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-background)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        "subtle-border": "var(--border-subtle)",
        "hover-border": "var(--border-hover)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          muted: "var(--color-primary-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          glow: "var(--color-accent-glow)",
        },
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-error)",
      },
      borderRadius: {
        card: "14px",
        button: "10px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.3)",
        card: "0 8px 30px rgba(0, 0, 0, 0.45)",
        glow: "0 0 25px rgba(59, 130, 246, 0.25)",
        cyan: "0 0 25px rgba(6, 182, 212, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
