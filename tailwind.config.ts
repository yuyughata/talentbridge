import type { Config } from "tailwindcss";

/**
 * Brand palette and design tokens from the TBA blueprint (§4 Visual and UX direction):
 *  - Deep navy  #102A43  trust and structure
 *  - Teal       #167D8D  action and progress
 *  - Off-white  #F7F9FA  page backgrounds
 *  - Amber      #E6A23C  attention
 *  - Red        only for risk / error
 *
 * Status colours map to the plain-language states required by the blueprint:
 *  Draft, Submitted, Under Review, Verified, Needs Evidence, Restricted, Archived.
 *  Note: "Verified" is intentionally NOT green — a green badge must never imply
 *  FIFA or transfer approval (§4 Status design).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#102A43",
          50: "#F0F4F8",
          100: "#D9E2EC",
          600: "#243B53",
          700: "#1B3350",
          800: "#152C47",
          900: "#102A43",
        },
        teal: {
          DEFAULT: "#167D8D",
          50: "#EAF4F5",
          100: "#D3E9EB",
          500: "#167D8D",
          600: "#136C7A",
          700: "#0F5A66",
        },
        amber: {
          DEFAULT: "#E6A23C",
          50: "#FDF6EC",
          500: "#E6A23C",
          600: "#C9872A",
        },
        risk: {
          DEFAULT: "#C0392B",
          50: "#FBEAE8",
          500: "#C0392B",
          600: "#A32F23",
        },
        canvas: "#F7F9FA",
        surface: "#FFFFFF",
        "surface-muted": "#F1F6F8",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Aptos",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 42, 67, 0.06), 0 4px 12px rgba(16, 42, 67, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
