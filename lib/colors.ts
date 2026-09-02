import type { ProductColor } from "@/lib/types";

/**
 * 产品颜色映射（便签背景色）/ Product color map (sticky-note background classes).
 *
 * 精选 10 种对比度较高的深色，对应 tailwind.config 中定义的 sticky-* 颜色。
 * 10 deeper, higher-contrast colors, matching the sticky-* utilities in tailwind.config.
 */
export const colorMap: Record<ProductColor, string> = {
  yellow: "bg-sticky-yellow",
  blue: "bg-sticky-blue",
  pink: "bg-sticky-pink",
  green: "bg-sticky-green",
  purple: "bg-sticky-purple",
  orange: "bg-sticky-orange",
  red: "bg-sticky-red",
  crimson: "bg-sticky-crimson",
  rose: "bg-sticky-rose",
  magenta: "bg-sticky-magenta",
  violet: "bg-sticky-violet",
  deepPurple: "bg-sticky-deepPurple",
  royalBlue: "bg-sticky-royalBlue",
  sky: "bg-sticky-sky",
  cyan: "bg-sticky-cyan",
  aqua: "bg-sticky-aqua",
  teal: "bg-sticky-teal",
  turquoise: "bg-sticky-turquoise",
  emerald: "bg-sticky-emerald",
  mint: "bg-sticky-mint",
  olive: "bg-sticky-olive",
  amber: "bg-sticky-amber",
  gold: "bg-sticky-gold",
  deepOrange: "bg-sticky-deepOrange",
  coral: "bg-sticky-coral",
  salmon: "bg-sticky-salmon",
  brown: "bg-sticky-brown",
  coffee: "bg-sticky-coffee",
  slate: "bg-sticky-slate",
};

/**
 * 便签色的十六进制值（与 tailwind.config 的 sticky-* 保持一致）。
 * Sticky-note hex values (kept in sync with the sticky-* colors in tailwind.config).
 *
 * 用于无法使用 Tailwind class 的场景，例如 ImageResponse 生成的 OG 图。
 * Used where Tailwind classes are unavailable, e.g. OG images via ImageResponse.
 */
export const colorHex: Record<ProductColor, string> = {
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
};
