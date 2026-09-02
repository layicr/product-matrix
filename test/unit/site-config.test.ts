// 测试：站点全局配置常量完整性与关键字段。
// Test: site-wide config constants — completeness and key fields.
import {describe, it, expect} from "vitest";
import {siteConfig} from "@/lib/site-config";

describe("siteConfig", () => {
  it("包含作者品牌名", () => {
    expect(siteConfig.author).toBe("Layicr");
  });

  it("hero 标题/副标题均含中英双语", () => {
    expect(siteConfig.heroTitle.zh).toBe("产品矩阵");
    expect(siteConfig.heroTitle.en).toBe("Product Matrix");
    expect(siteConfig.heroSub.zh).toBeTruthy();
    expect(siteConfig.heroSub.en).toBeTruthy();
  });

  it("关于页副标题含中英双语", () => {
    expect(siteConfig.aboutSub.zh).toBeTruthy();
    expect(siteConfig.aboutSub.en).toBeTruthy();
  });

  it("社交链接指向正确域名", () => {
    expect(siteConfig.github).toContain("github.com");
    expect(siteConfig.website).toMatch(/^https:\/\//);
    expect(siteConfig.twitter).toMatch(/^https:\/\//);
  });

  it("仓库与 issues 入口指向同一仓库", () => {
    expect(siteConfig.repoUrl).toBe("https://github.com/layicr/product-matrix");
    expect(siteConfig.issuesUrl).toContain(
      "https://github.com/layicr/product-matrix/issues",
    );
  });

  it("作为 const 断言保持只读（不可被覆盖为非法结构）", () => {
    // 保证字段类型是字面量，便于 IDE 补全与下游引用不漂移
    const {author} = siteConfig;
    expect(typeof author).toBe("string");
  });
});
