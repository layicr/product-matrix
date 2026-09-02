// 单元测试：lib/seo 的 hreflang 与 alternates 生成（双语 SEO 单一真源）。
// Unit test: lib/seo hreflang & alternates builder (bilingual SEO single source).
import {describe, it, expect} from "vitest";
import {hreflangLanguages, localeAlternates} from "@/lib/seo";
import {routing} from "@/i18n/routing";

describe("hreflangLanguages", () => {
  it("为每种 locale 与 x-default 生成条目", () => {
    const map = hreflangLanguages("/about");
    const expectedKeys = [...routing.locales, "x-default"].sort();
    expect(Object.keys(map).sort()).toEqual(expectedKeys);
  });

  it("每条目都是绝对 URL", () => {
    const map = hreflangLanguages("/products/p0001");
    for (const url of Object.values(map)) {
      expect(url).toMatch(/^https?:\/\//);
    }
  });

  it("x-default 指向默认语言路径", () => {
    const map = hreflangLanguages("/about");
    const expected = map[routing.defaultLocale];
    expect(map["x-default"]).toBe(expected);
  });

  it("空路径也生成合法条目（不丢尾斜杠语义）", () => {
    const map = hreflangLanguages("");
    expect(map[routing.defaultLocale]).toMatch(/^https?:\/\/\S+$/);
  });
});

describe("localeAlternates", () => {
  it("返回 canonical 与 languages", () => {
    const alt = localeAlternates("en", "/about");
    expect(alt.canonical).toMatch(/^https?:\/\//);
    expect(alt.languages).toHaveProperty("x-default");
    expect(alt.languages).toHaveProperty("en");
  });

  it("canonical 与对应 hreflang 条目一致", () => {
    const alt = localeAlternates("zh", "/about");
    expect(alt.canonical).toBe(alt.languages["zh"]);
  });
});
