/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#cbd5e1",
        ring: "rgb(166, 194, 250)",
        background: "#ffffff",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "rgb(166, 194, 250)",
          foreground: "#0f172a",
        },
        secondary: {
          DEFAULT: "#f6f8fc",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f6f8fc",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "rgba(166, 194, 250, 0.12)",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        }
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 12px 0 rgba(15, 23, 42, 0.03)",
        elevation: "0 12px 24px -4px rgba(15, 23, 42, 0.04)",
      }
    },
  },
  plugins: [],
}
