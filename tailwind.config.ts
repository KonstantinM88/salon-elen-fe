import type { Config } from "tailwindcss";


const config: Config = {
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
boxShadow: {
soft: "0 6px 24px rgba(0,0,0,0.06)",
},
borderRadius: {
'2xl': '1rem',
}
},
},
plugins: [],
};
export default config;