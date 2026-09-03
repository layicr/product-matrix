// 产品上线状态 / Product lifecycle status.
export type ProductStatus = "live" | "soon" | "planned" | "archived";

// 便签配色键名，对应 lib/colors.ts 的 colorMap 与 tailwind.config 的 sticky-* 颜色。
// Sticky-note color key, maps to colorMap in lib/colors.ts and the sticky-* colors in tailwind.config.
export type ProductColor =
  | "yellow"
  | "blue"
  | "pink"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "crimson"
  | "rose"
  | "magenta"
  | "violet"
  | "deepPurple"
  | "royalBlue"
  | "sky"
  | "cyan"
  | "aqua"
  | "teal"
  | "turquoise"
  | "emerald"
  | "mint"
  | "olive"
  | "amber"
  | "gold"
  | "deepOrange"
  | "coral"
  | "salmon"
  | "brown"
  | "coffee"
  | "slate";

// 产品数据模型（双语言字段以 { zh, en } 形式存储）。
// Product model (bilingual fields stored as { zh, en }).
export interface Product {
  id: string;        // 产品唯一标识，如 p0001 / Unique product id, e.g. p0001.
  num: string;       // 展示编号，如 "01" / Display number, e.g. "01".
  name: { zh: string; en: string };        // 产品名称（中/英）/ Product name (zh/en).
  category: { zh: string; en: string };    // 产品分类（中/英）/ Product category (zh/en).
  color: ProductColor;                     // 便签配色键 / Sticky-note color key.
  status: ProductStatus;                   // 上线状态 / Lifecycle status.
  isNew: boolean;                          // 是否新上线（卡片 NEW 角标）/ Newly launched flag.
  isWatched: boolean;                      // 是否关注（卡片小火图标）/ Watched/followed flag.
  isPopup: boolean;                        // 是否为首页弹框产品 / Homepage popup flag.
  launch: string;                          // 上线时间，如 "2026.Q1" / Launch quarter, e.g. "2026.Q1".
  demoUrl: string;                         // 预约演示外链 / Demo link.
  desc: { zh: string; en: string };        // 产品描述（中/英）/ Description (zh/en).
  features: { zh: string[]; en: string[] };// 核心特性列表（中/英）/ Key features (zh/en).
}
