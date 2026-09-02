// 单元测试：app/robots 动态生成（主流爬虫放行、/api/ 禁用、sitemap 绝对 URL）。
// Unit test: app/robots dynamic generation (allow major crawlers, disallow /api/, absolute sitemap URL).
import {describe, it, expect} from "vitest";
import robots from "@/app/robots";

describe("app/robots", () => {
  it("包含通用、Googlebot、Baiduspider 三条规则", () => {
    const result = robots();
    expect(result.rules).toHaveLength(3);
    const agents = result.rules.map((r) => r.userAgent);
    expect(agents).toContain("*");
    expect(agents).toContain("Googlebot");
    expect(agents).toContain("Baiduspider");
  });

  it("所有规则允许根路径并禁止 /api/", () => {
    const result = robots();
    for (const rule of result.rules) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toContain("/api/");
    }
  });

  it("sitemap 指向绝对 URL 的 /sitemap.xml", () => {
    const result = robots();
    expect(result.sitemap).toMatch(/^https?:\/\/.*\/sitemap\.xml$/);
  });
});
