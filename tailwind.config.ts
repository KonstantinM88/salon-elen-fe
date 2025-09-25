// tailwind.config.ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
      boxShadow: { soft: "0 6px 24px rgba(0,0,0,0.06)" },
      borderRadius: { "2xl": "1rem" },

      // Кастомная типографика для статей
      typography: ({ theme }) => ({
        elen: {
          css: {
            color: String(theme("colors.gray.800")),
            maxWidth: "68ch",
            lineHeight: "1.75",

            p: { marginTop: "0.85em", marginBottom: "0.85em" },

            h2: {
              fontWeight: "700",
              fontSize: "1.5rem",
              lineHeight: "1.3",
              marginTop: "1.6em",
              marginBottom: "0.7em",
            },
            h3: {
              fontWeight: "600",
              fontSize: "1.25rem",
              lineHeight: "1.35",
              marginTop: "1.4em",
              marginBottom: "0.6em",
            },

            "ul,ol": { marginTop: "0.8em", marginBottom: "0.8em" },
            "ul > li, ol > li": { paddingLeft: "0.4em" },
            "ul > li::marker": { color: String(theme("colors.gray.500")) },
            "ol > li::marker": { color: String(theme("colors.gray.500")) },

            blockquote: {
              fontStyle: "normal",
              borderLeftColor: String(theme("colors.gray.300")),
              color: String(theme("colors.gray.700")),
              paddingLeft: "1em",
              marginTop: "1.2em",
              marginBottom: "1.2em",
            },

            strong: { color: String(theme("colors.gray.900")) },
            em: { color: String(theme("colors.gray.900")) },
            a: { color: String(theme("colors.blue.600")), textDecoration: "none" },

            img: { borderRadius: String(theme("borderRadius.xl")) },
          },
        },

        invert: {
          css: {
            color: String(theme("colors.gray.200")),
            strong: { color: String(theme("colors.gray.100")) },
            em: { color: String(theme("colors.gray.100")) },
            a: { color: String(theme("colors.blue.400")) },
            blockquote: {
              borderLeftColor: String(theme("colors.gray.700")),
              color: String(theme("colors.gray.300")),
            },
            "ul > li::marker, ol > li::marker": {
              color: String(theme("colors.gray.500")),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;

export default config;
