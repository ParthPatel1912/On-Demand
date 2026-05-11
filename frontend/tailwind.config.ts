import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        ink: {
          DEFAULT: "#333333",
          muted: "#666666",
          heading: "#111111",
          rich: "#08060D",
          slate: "#1C2434",
          disabled: "#8D8D8D",
          subtle: "#999999",
          deep: "#1A1C21",
          mid: "#474747",
          hint: "#8B909A",
          rank: "#7F8694",
          panel: "#2D3340",
          panelStrong: "#2B3040",
          pageheading: "#121826",
          currency: "#189E3C",
          bookingPrimary: "#4540E1",
        },
        dashboard: {
          positive: "#189E3C",
          negative: "#BE0A04",
          "positive-soft": "#189E3C1F",
          "negative-soft": "#BE0A041F",
        },
        line: {
          DEFAULT: "#DDE4EE",
          muted: "#E5E4E7",
          soft: "#EEF1F6",
          "period-tab": "#EEF2F6",
          subtle: "#F1F3F6",
          light: "#EBEBEB",
          strong: "#DDDDDD",
          input: "#DDE4E1",
        },
        surface: {
          dashboard: "#F2F5F9",
          card: "#F4F6FA",
          neutral: "#F5F5F5",
          muted: "#EDEDED",
          subtle: "#F2F2F2",
          elevated: "#F8FAFC",
          tint: "#F9F9FF",
          faint: "#F7F7F7",
          faintAlt: "#F6F6F6",
        },
        status: {
          success: {
            DEFAULT: "#137C2F",
            soft: "#1EA13F24",
          },
          danger: {
            DEFAULT: "#8C0703",
            soft: "#BE0A0424",
          },
          warning: {
            DEFAULT: "#C1601B",
            soft: "#E1752724",
          },
          inactive: {
            DEFAULT: "#525252",
            soft: "#DDE4EE",
          },
        },
        booking: {
          pending: "#FF6B35",
          confirmed: "#3B82F6",
          completed: "#10B981",
          cancelled: "#EF4444",
          unknown: "#9CA3AF",
        },
        grey: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          soft: "hsl(var(--primary-soft))",
          deep: "#302DA8",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        cta: {
          DEFAULT: "hsl(var(--cta))",
          foreground: "hsl(var(--cta-foreground))",
        },
        border: "hsl(var(--border))",
        "outlined-border": "hsl(var(--outlined-border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        alexandria: ["Alexandria", "sans-serif"],
        figtree: ["Figtree", "sans-serif"],
      },
      fontSize: {
        xxs:"10px",
        xs: "12px",
        sm: "14px",
        base: "16px",
        md: "18px",
        lg: "20px",
        xl: "24px",
        heading: "28px",
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
