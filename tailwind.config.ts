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

      // ====== ОПТИМИЗИРОВАННЫЕ ШРИФТЫ ======
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },

      // Цвета
      colors: {
        gold: {
          50:  "#FFFBEB",
          100: "#FFF3C4",
          200: "#FFE380",
          300: "#FFD54F",
          400: "#FFC107",
          500: "#FFB300",
          600: "#FFA000",
          700: "#FF8F00",
          800: "#FF6F00",
          900: "#E65100",
        },
      },

      // Анимации
      animation: {
        fadeIn: "fadeIn 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
        scaleIn: "scaleIn 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },

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




// // tailwind.config.ts
// import type { Config } from "tailwindcss";
// import typography from "@tailwindcss/typography";

// const config = {
//   darkMode: "class",
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       container: {
//         center: true,
//         padding: "1rem",
//         screens: { "2xl": "1200px" },
//       },
//       boxShadow: { soft: "0 6px 24px rgba(0,0,0,0.06)" },
//       borderRadius: { "2xl": "1rem" },

//       // Цвета
//       colors: {
//         gold: {
//           50:  "#FFFBEB",
//           100: "#FFF3C4",
//           200: "#FFE380",
//           300: "#FFD54F",
//           400: "#FFC107",
//           500: "#FFB300",
//           600: "#FFA000",
//           700: "#FF8F00",
//           800: "#FF6F00",
//           900: "#E65100",
//         },
//       },

//       // Анимации
//       animation: {
//         fadeIn: "fadeIn 0.6s ease-out",
//         slideUp: "slideUp 0.6s ease-out",
//         scaleIn: "scaleIn 0.4s ease-out",
//         shimmer: "shimmer 2s linear infinite",
//       },
//       keyframes: {
//         fadeIn: {
//           "0%": { opacity: "0" },
//           "100%": { opacity: "1" },
//         },
//         slideUp: {
//           "0%": { opacity: "0", transform: "translateY(30px)" },
//           "100%": { opacity: "1", transform: "translateY(0)" },
//         },
//         scaleIn: {
//           "0%": { opacity: "0", transform: "scale(0.9)" },
//           "100%": { opacity: "1", transform: "scale(1)" },
//         },
//         shimmer: {
//           "0%": { backgroundPosition: "-1000px 0" },
//           "100%": { backgroundPosition: "1000px 0" },
//         },
//       },

//       // Кастомная типографика для статей
//       typography: ({ theme }) => ({
//         elen: {
//           css: {
//             color: String(theme("colors.gray.800")),
//             maxWidth: "68ch",
//             lineHeight: "1.75",

//             p: { marginTop: "0.85em", marginBottom: "0.85em" },

//             h2: {
//               fontWeight: "700",
//               fontSize: "1.5rem",
//               lineHeight: "1.3",
//               marginTop: "1.6em",
//               marginBottom: "0.7em",
//             },
//             h3: {
//               fontWeight: "600",
//               fontSize: "1.25rem",
//               lineHeight: "1.35",
//               marginTop: "1.4em",
//               marginBottom: "0.6em",
//             },

//             "ul,ol": { marginTop: "0.8em", marginBottom: "0.8em" },
//             "ul > li, ol > li": { paddingLeft: "0.4em" },
//             "ul > li::marker": { color: String(theme("colors.gray.500")) },
//             "ol > li::marker": { color: String(theme("colors.gray.500")) },

//             blockquote: {
//               fontStyle: "normal",
//               borderLeftColor: String(theme("colors.gray.300")),
//               color: String(theme("colors.gray.700")),
//               paddingLeft: "1em",
//               marginTop: "1.2em",
//               marginBottom: "1.2em",
//             },

//             strong: { color: String(theme("colors.gray.900")) },
//             em: { color: String(theme("colors.gray.900")) },
//             a: { color: String(theme("colors.blue.600")), textDecoration: "none" },

//             img: { borderRadius: String(theme("borderRadius.xl")) },
//           },
//         },

//         invert: {
//           css: {
//             color: String(theme("colors.gray.200")),
//             strong: { color: String(theme("colors.gray.100")) },
//             em: { color: String(theme("colors.gray.100")) },
//             a: { color: String(theme("colors.blue.400")) },
//             blockquote: {
//               borderLeftColor: String(theme("colors.gray.700")),
//               color: String(theme("colors.gray.300")),
//             },
//             "ul > li::marker, ol > li::marker": {
//               color: String(theme("colors.gray.500")),
//             },
//           },
//         },
//       }),
//     },
//   },
//   plugins: [typography],
// } satisfies Config;

// export default config;
