// 单元测试：lib/colors 调色板完整性 / Unit test: lib/colors palette integrity.
//
// 校验 colorMap / colorHex 与 ProductColor 类型三处保持同步：
// - colorMap 与 colorHex 键集合完全一致
// - 覆盖 ProductColor 的全部 29 个色键
// - 格式合法（bg-sticky-* class / 6 位十六进制）
import {describe, it, expect} from "vitest";
import {colorMap, colorHex} from "@/lib/colors";
import type {ProductColor} from "@/lib/types";

// ProductColor 全量色键（与 lib/types/product.ts 保持同步）。
// Full palette keys (kept in sync with lib/types/product.ts).
const ALL_COLORS: ProductColor[] = [
  "yellow", "blue", "pink", "green", "purple", "orange", "red",
  "crimson", "rose", "magenta", "violet", "deepPurple", "royalBlue",
  "sky", "cyan", "aqua", "teal", "turquoise", "emerald", "mint",
  "olive", "amber", "gold", "deepOrange", "coral", "salmon",
  "brown", "coffee", "slate",
];

describe("lib/colors 调色板完整性", () => {
  it("colorMap 与 colorHex 键集合完全一致（防止两处脱节）", () => {
    expect(Object.keys(colorMap).sort()).toEqual(Object.keys(colorHex).sort());
  });

  it("覆盖 ProductColor 的全部 29 个色键", () => {
    const keys = Object.keys(colorMap).sort() as ProductColor[];
    expect(keys).toEqual([...ALL_COLORS].sort());
    expect(keys).toHaveLength(29);
  });

  it("colorMap 的每项为合法的 bg-sticky-* Tailwind class", () => {
    for (const [key, cls] of Object.entries(colorMap)) {
      expect(cls).toBe(`bg-sticky-${key}`);
      expect(cls).toMatch(/^bg-sticky-[A-Za-z]+$/);
    }
  });

  it("colorHex 的每项为合法 6 位十六进制色值", () => {
    for (const value of Object.values(colorHex)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
