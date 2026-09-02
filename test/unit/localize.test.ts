// 单元测试：getLocalizedProduct 纯函数的本地化与无副作用校验。
// Unit test: pure-function getLocalizedProduct (localization & no side effects).
import {describe, it, expect, vi} from "vitest";

// Mock unstable_cache：测试环境缺少 incrementalCache，直接透传原始函数。
// Mock unstable_cache: test env lacks incrementalCache, pass through to original function.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, _key?: unknown, _opts?: unknown) => fn,
}));

import {getLocalizedProduct, type Language} from "@/lib/localize";
import type {Product} from "@/lib/types";
import {getAllProducts} from "@/lib/queries/products";

const sampleProduct: Product = {
  id: "p0001",
  num: "01",
  name: {zh: "智能风控引擎", en: "Risk Control Engine"},
  category: {zh: "风控", en: "Risk"},
  color: "coffee",
  status: "live",
  launch: "2024-Q1",
  demoUrl: "https://example.com/demo",
  desc: {zh: "中文描述", en: "English description"},
  features: {zh: ["特性一", "特性二"], en: ["Feature one", "Feature two"]},
  isNew: true,
  isWatched: false,
};

function localizeForAll(product: Product) {
  const langs: Language[] = ["zh", "en"];
  return langs.map((lang) => ({lang, lp: getLocalizedProduct(product, lang)}));
}

describe("getLocalizedProduct", () => {
  it("本地化 zh 字段（name/category/desc/features）", () => {
    const lp = getLocalizedProduct(sampleProduct, "zh");
    expect(lp.name).toBe("智能风控引擎");
    expect(lp.category).toBe("风控");
    expect(lp.desc).toBe("中文描述");
    expect(lp.features).toEqual(["特性一", "特性二"]);
  });

  it("本地化 en 字段（name/category/desc/features）", () => {
    const lp = getLocalizedProduct(sampleProduct, "en");
    expect(lp.name).toBe("Risk Control Engine");
    expect(lp.category).toBe("Risk");
    expect(lp.desc).toBe("English description");
    expect(lp.features).toEqual(["Feature one", "Feature two"]);
  });

  it("保留非本地化字段（id/num/color/status/launch/demoUrl/isNew/isWatched）", () => {
    const lp = getLocalizedProduct(sampleProduct, "zh");
    expect(lp.id).toBe("p0001");
    expect(lp.num).toBe("01");
    expect(lp.color).toBe("coffee");
    expect(lp.status).toBe("live");
    expect(lp.launch).toBe("2024-Q1");
    expect(lp.demoUrl).toBe("https://example.com/demo");
    expect(lp.isNew).toBe(true);
    expect(lp.isWatched).toBe(false);
  });

  it("返回的对象是平铺字符串字段，而非嵌套 {zh,en} 结构", () => {
    const lp = getLocalizedProduct(sampleProduct, "en");
    expect(typeof lp.name).toBe("string");
    expect(typeof lp.category).toBe("string");
    expect(typeof lp.desc).toBe("string");
    expect(Array.isArray(lp.features)).toBe(true);
    expect(lp.features.every((f) => typeof f === "string")).toBe(true);
  });

  it("只取请求语言的字段，且不包含另一语言的值", () => {
    const lp = getLocalizedProduct(sampleProduct, "en");
    expect(lp.name).toBe(sampleProduct.name.en);
    expect(lp.name).not.toBe(sampleProduct.name.zh);
    expect(lp.features).toEqual(sampleProduct.features.en);
  });

  it("不修改原始 product 对象（纯函数、无副作用）", () => {
    const snapshot = JSON.stringify(sampleProduct);
    getLocalizedProduct(sampleProduct, "en");
    getLocalizedProduct(sampleProduct, "zh");
    expect(JSON.stringify(sampleProduct)).toBe(snapshot);
  });

  it("对空 features 数组也能正确本地化", () => {
    const empty: Product = {...sampleProduct, features: {zh: [], en: []}};
    expect(getLocalizedProduct(empty, "zh").features).toEqual([]);
    expect(getLocalizedProduct(empty, "en").features).toEqual([]);
  });

  it("对每种语言返回的字段数量与结构一致", () => {
    const results = localizeForAll(sampleProduct);
    const keys = Object.keys(results[0].lp).sort();
    for (const {lp} of results) {
      expect(Object.keys(lp).sort()).toEqual(keys);
    }
  });

  it("可正确本地化全部产品（无抛错、字段非空）", async () => {
    const all = await getAllProducts();
    expect(all.length).toBeGreaterThan(0);
    for (const p of all) {
      const zh = getLocalizedProduct(p, "zh");
      const en = getLocalizedProduct(p, "en");
      expect(typeof zh.name).toBe("string");
      expect(zh.name.length).toBeGreaterThan(0);
      expect(typeof en.name).toBe("string");
      expect(en.name.length).toBeGreaterThan(0);
      expect(zh.features.length).toBe(p.features.zh.length);
      expect(en.features.length).toBe(p.features.en.length);
      expect(zh.category).toBe(p.category.zh);
      expect(en.category).toBe(p.category.en);
    }
  });
});
