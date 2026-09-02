// 单元测试：About 页统计项构建（合作伙伴为 0 时的隐藏逻辑）。
// Unit test: About page stat builder (the hide-when-zero partners rule).
import {describe, it, expect} from "vitest";
import {buildAboutStats} from "@/lib/about-stats";

describe("buildAboutStats", () => {
  it("合作伙伴为 0 时只返回核心产品一项", () => {
    const stats = buildAboutStats(6, 0);
    expect(stats).toHaveLength(1);
    expect(stats[0].labelKey).toBe("about.stat1");
    expect(stats[0].num).toBe("6+");
  });

  it("合作伙伴大于 0 时返回两项，第二项为合作伙伴", () => {
    const stats = buildAboutStats(6, 3);
    expect(stats).toHaveLength(2);
    expect(stats[0].labelKey).toBe("about.stat1");
    expect(stats[1].labelKey).toBe("about.stat2");
    expect(stats[1].num).toBe("3+");
  });

  it("合作伙伴为 0 时结果中不含 about.stat2", () => {
    const labelKeys = buildAboutStats(6, 0).map((s) => s.labelKey);
    expect(labelKeys).not.toContain("about.stat2");
  });

  it("数量统一带 + 后缀", () => {
    const stats = buildAboutStats(2, 5);
    expect(stats[0].num).toBe("2+");
    expect(stats[1].num).toBe("5+");
  });

  it("核心产品为 0 时仍保留该项（空产品库是合法状态）", () => {
    const stats = buildAboutStats(0, 0);
    expect(stats).toHaveLength(1);
    expect(stats[0].num).toBe("0+");
  });

  it("返回新数组，多次调用互不干扰", () => {
    const a = buildAboutStats(6, 2);
    const b = buildAboutStats(6, 0);
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(1);
  });
});
