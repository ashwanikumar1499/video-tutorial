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
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-dark": "var(--accent-dark)",
        surface: "var(--surface)",
        "surface-mixed": "var(--surface-mixed)",
        border: "var(--border)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--foreground)",
            h1: {
              color: "var(--foreground)",
              fontWeight: "600",
            },
            h2: {
              color: "var(--foreground)",
              fontWeight: "600",
            },
            h3: {
              color: "var(--foreground)",
              fontWeight: "600",
            },
            a: {
              color: "var(--accent)",
              textDecoration: "none",
              "&:hover": {
                color: "var(--accent-dark)",
              },
            },
            pre: {
              backgroundColor: "var(--surface-mixed)",
              color: "var(--foreground)",
            },
            code: {
              color: "var(--foreground)",
              backgroundColor: "var(--surface-mixed)",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            blockquote: {
              color: "var(--foreground)",
              borderLeftColor: "var(--accent)",
              backgroundColor: "var(--surface)",
              fontStyle: "normal",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};

export default config;
