// Tailwind CSS 配置：便签涂鸦风格的设计令牌（sticky-* 便签色、手写字体、硬阴影、动画）。
// Tailwind config: doodle-style design tokens (sticky-* note colors, hand fonts, hard shadows, animations).
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    // 便签配色类名以字面量写在 lib/colors.ts、lib/status.ts，必须纳入扫描，
    // 否则 bg-sticky-* 工具类不会生成，便签背景会缺失。
    // Sticky-note class names are written literally in lib/colors.ts & lib/status.ts;
    // include lib so those bg-sticky-* utilities are actually generated.
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FDF6E3",
        ink: "#2C2C2C",
        "ink-light": "#555555",
        // 便签配色，对应 lib/colors.ts 的 colorMap / Sticky-note colors, matching colorMap in lib/colors.ts.
        // 仅保留实际被产品与浮动按钮使用的颜色 / Only colors actually assigned to products or buttons.
        // blue/pink 用于 Hero 数字下划线、About 联系卡片、错误页按钮、团队头像等装饰元素。
        // blue/pink are used for Hero stat underlines, About contact tiles, error-page buttons & team avatars.
        sticky: {
          yellow: "#FFF59D",
          blue: "#B3E5FC",
          pink: "#F8BBD0",
          green: "#C8E6C9",
          purple: "#E1BEE7",
          orange: "#FFE0B2",
          red: "#FFCDD2",
          crimson: "#E57373",
          rose: "#F06292",
          magenta: "#BA68C8",
          violet: "#B39DDB",
          deepPurple: "#D1C4E9",
          royalBlue: "#7986CB",
          sky: "#81D4FA",
          cyan: "#B2EBF2",
          aqua: "#80DEEA",
          teal: "#B2DFDB",
          turquoise: "#4DB6AC",
          emerald: "#A5D6A7",
          mint: "#B9F6CA",
          olive: "#DCE775",
          amber: "#FFECB3",
          gold: "#FFE082",
          deepOrange: "#FFCCBC",
          coral: "#FF7043",
          salmon: "#FF5722",
          brown: "#A1887F",
          coffee: "#8D6E63",
          slate: "#78909C",
        },
      },
      fontFamily: {
        hand: ["\"ZCOOL KuaiLe\"", "cursive"],
        script: ["\"ZCOOL KuaiLe\"", "\"Patrick Hand\"", "cursive"],
        caveat: ["Caveat", "cursive"],
        sans: ["\"Noto Sans SC\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sticky: "2px 2px 8px rgba(0,0,0,0.12), inset 0 0 30px rgba(0,0,0,0.03)",
        "hand-btn": "3px 3px 0 rgba(0,0,0,0.2)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        "paper-in": {
          from: { transform: "rotate(-3deg) scale(0.9) translateY(20px)", opacity: "0" },
          to: { transform: "rotate(-0.5deg) scale(1) translateY(0)", opacity: "1" },
        },
      },
      animation: {
        wiggle: "wiggle 3s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s infinite",
        "paper-in": "paper-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
