import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--color-canvas)",
          subtle: "var(--color-canvas-subtle)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          subtle: "var(--color-ink-subtle)",
          muted: "var(--color-ink-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          contrast: "var(--color-accent-contrast)",
        },
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        cross: "var(--color-cross)",
        nought: "var(--color-nought)",
        line: "var(--color-line)",
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 8px 24px -12px rgba(15,23,42,0.18)",
        focus: "0 0 0 3px var(--color-focus-ring)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        pop: "pop 200ms ease-out",
        fade: "fade 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
