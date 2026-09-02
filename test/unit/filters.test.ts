// 单元测试：lib/filters 筛选项单一真源（顺序 / 默认项 / 与状态类型一致）。
// Unit test: lib/filters single source of truth (order, default, type alignment).
import {describe, it, expect} from "vitest";
import {FILTER_KEYS, DEFAULT_FILTER} from "@/lib/filters";
import type {ProductStatus} from "@/lib/types";

describe("FILTER_KEYS / DEFAULT_FILTER", () => {
  it("默认筛选为第一项且为 all", () => {
    expect(DEFAULT_FILTER).toBe("all");
    expect(FILTER_KEYS[0]).toBe(DEFAULT_FILTER);
  });

  it("共 5 项：all + 4 种状态", () => {
    expect(FILTER_KEYS).toHaveLength(5);
    expect(FILTER_KEYS).toEqual(["all", "live", "soon", "planned", "archived"]);
  });

  it("除 all 外，每项都是合法的 ProductStatus", () => {
    const statuses = new Set<ProductStatus>([
      "live",
      "soon",
      "planned",
      "archived",
    ]);
    for (const key of FILTER_KEYS) {
      if (key === "all") continue;
      expect(statuses.has(key)).toBe(true);
    }
  });
});
