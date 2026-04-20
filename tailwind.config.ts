import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./server/**/*.{ts,tsx}",
    "./remotion/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#242424",
        porcelain: "#F8F6F2",
        rose: "#B76E79",
        sage: "#7F927D",
        gold: "#B99A5B"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
