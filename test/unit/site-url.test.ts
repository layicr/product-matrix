// 单元测试：站点绝对 URL 工具（防未配置时产出 "undefined/..."）。
// Unit test: absolute site URL helper (prevents "undefined/..." when unconfigured).
import {describe, it, expect} from "vitest";
import {absoluteUrl, SITE_URL, HAS_SITE_URL} from "@/lib/site-url";

describe("absoluteUrl", () => {
  it("绝不产出包含 undefined 的 URL", () => {
    for (const path of ["/zh", "/zh/about", "/en/products/1", "/"]) {
      expect(absoluteUrl(path)).not.toContain("undefined");
    }
  });

  it("始终返回绝对 URL（http/https 开头）", () => {
    expect(absoluteUrl("/zh")).toMatch(/^https?:\/\//);
  });

  it("为缺前导斜杠的路径自动补上", () => {
    const withSlash = absoluteUrl("/zh");
    const without = absoluteUrl("zh");
    expect(without).toBe(withSlash);
  });

  it("已配置站点 URL 时以它为前缀", () => {
    const expected = HAS_SITE_URL ? `${SITE_URL}/zh/about` : "http://localhost:3000/zh/about";
    expect(absoluteUrl("/zh/about")).toBe(expected);
  });

  it("根路径不产生双斜杠", () => {
    expect(absoluteUrl("/")).not.toMatch(/[^:]\/\/$/);
  });
});
