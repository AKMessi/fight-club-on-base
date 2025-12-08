import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050505",
          panel: "#0f0f10",
          neon: "#00ff7f",
          accent: "#00ffcc",
          muted: "#7efddc"
        }
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "'Fira Code'", "'Space Mono'", "monospace"]
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 127, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;

