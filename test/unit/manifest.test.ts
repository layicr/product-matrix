// 单元测试：app/manifest PWA 清单（品牌信息、独立展示、真实存在的图标）。
// Unit test: app/manifest PWA manifest (branding, standalone display, existing icon).
import {describe, it, expect} from "vitest";
import manifest from "@/app/manifest";
import {siteConfig} from "@/lib/site-config";

describe("app/manifest", () => {
  it("name 合并中英文标题，short_name 使用中文标题", () => {
    const m = manifest();
    expect(m.name).toContain(siteConfig.heroTitle.zh);
    expect(m.name).toContain(siteConfig.heroTitle.en);
    expect(m.short_name).toBe(siteConfig.heroTitle.zh);
  });

  it("以根路径为起始页并使用独立展示模式", () => {
    const m = manifest();
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
  });

  it("指定品牌背景色与主题色", () => {
    const m = manifest();
    expect(m.background_color).toBe("#F5F0E8");
    expect(m.theme_color).toBe("#1A1A1A");
    expect(m.lang).toBe("zh-CN");
  });

  it("图标引用 /icon.svg（此前引用不存在的 png 已修复）", () => {
    const m = manifest();
    expect(m.icons).toHaveLength(1);
    expect(m.icons![0].src).toBe("/icon.svg");
    expect(m.icons![0].type).toBe("image/svg+xml");
  });
});
