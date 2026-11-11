import type { Config } from "tailwindcss";

/**
 * Brand palette and design tokens from the TBA blueprint (§4 Visual and UX direction):
 *  - Deep navy  #102A43  trust and structure
 *  - Teal       #167D8D  action and progress
 *  - Off-white  #F7F9FA  page backgrounds
 *  - Amber      #E6A23C  attention
 *  - Red        only for risk / error
 *
 * Extended with depth shades, a pitch-line motif and subtle motion so the
 * product reads as a premium sports-tech tool (§4 "should feel like a
 * professional sports-tech product used by scouts and club recruitment staff").
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
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#627D98",
          500: "#334E68",
          600: "#243B53",
          700: "#1B3350",
          800: "#152C47",
          900: "#102A43",
          950: "#0A1D30",
        },
        // Near-black surfaces for the public marketing site (black theme).
        ink: {
          DEFAULT: "#0A0B0D",
          950: "#060708",
          900: "#0A0B0D",
          800: "#121419",
          700: "#1A1D23",
          600: "#23272E",
        },
        teal: {
          DEFAULT: "#167D8D",
          50: "#EAF4F5",
          100: "#D3E9EB",
          200: "#A7D3D7",
          300: "#6FB8BF",
          400: "#3C9CA6",
          500: "#167D8D",
          600: "#136C7A",
          700: "#0F5A66",
          800: "#0C4752",
          900: "#0A3B44",
        },
        amber: {
          DEFAULT: "#E6A23C",
          50: "#FDF6EC",
          100: "#FAE9CF",
          400: "#EDB45E",
          500: "#E6A23C",
          600: "#C9872A",
          700: "#A66E1F",
        },
        risk: {
          DEFAULT: "#C0392B",
          50: "#FBEAE8",
          100: "#F5D2CE",
          500: "#C0392B",
          600: "#A32F23",
        },
        canvas: "#F6F8FA",
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
      letterSpacing: {
        tightest: "-0.03em",
      },
      borderRadius: {
        card: "0.875rem",
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 42, 67, 0.05), 0 6px 16px rgba(16, 42, 67, 0.06)",
        lift: "0 12px 32px -8px rgba(16, 42, 67, 0.22)",
        "teal-glow": "0 10px 30px -10px rgba(22, 125, 141, 0.55)",
        "inset-hair": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "navy-depth":
          "radial-gradient(120% 120% at 15% 0%, #1B3350 0%, #102A43 45%, #0A1D30 100%)",
        "ink-depth":
          "radial-gradient(130% 120% at 20% -10%, #15181F 0%, #0A0B0D 45%, #060708 100%)",
        "teal-sheen": "linear-gradient(135deg, #167D8D 0%, #0F5A66 100%)",
        "amber-sheen": "linear-gradient(135deg, #EDB45E 0%, #E6A23C 100%)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
