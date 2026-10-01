import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        lavender: { DEFAULT: "#B79FF7", soft: "#EDE7FF", deep: "#7C5CE0" },
        blush: "#FDF2F8"
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)"
      },
      boxShadow: {
        soft: "0 2px 16px -2px hsl(330 60% 70% / 0.18)",
        lift: "0 12px 32px -8px hsl(255 60% 60% / 0.22)",
        card: "0 4px 24px -6px hsl(300 40% 50% / 0.12)"
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] }
    }
  },
  plugins: []
};

export default config;
