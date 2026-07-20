import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Raw brand palette used by charts, chips and status colours */
        brand: {
          /* Vert d'action — porte les boutons pleins de toute l'application.
             Volontairement clair : il se lit avec un texte encre, pas blanc
             (contraste 10,5:1 contre 1,7:1). Voir le variant `primary`. */
          action: "#5EDE99",
          actionDark: "#45C983",
          actionWash: "#E8FBF1",
          /* Vert lisible sur blanc (5,3:1) — textes, liens, item de menu actif.
             #5EDE99 ne peut pas servir de couleur de texte : 1,7:1. */
          actionInk: "#0E7C52",
          /* Vert intermédiaire — séries de graphique, bordures actives, focus. */
          actionMid: "#16A46B",
          actionLine: "#BFEFD5",
          /* Ambre conservé pour ce qui signale : retard, alerte, à valider. */
          amber: "#E58A00",
          ink: "#101828",
          slate: "#667085",
          line: "#EAECF0",
          green: "#2E7D32",
          red: "#D92D20",
          blue: "#3976D3",
          purple: "#8B5E9F",
          teal: "#2C9C9C",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        modal:
          "0 20px 32px -8px rgba(16, 24, 40, 0.14), 0 8px 12px -6px rgba(16, 24, 40, 0.06)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "zoom-in": "zoom-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
