// 单元测试：lib/search 的 productMatchesQuery 纯函数（中英文跨字段搜索）。
// Unit test: lib/search productMatchesQuery (cross-field zh/en search).
import {describe, it, expect} from "vitest";
import {productMatchesQuery} from "@/lib/search";
import type {Product} from "@/lib/types";

const product: Product = {
  id: "p0001",
  num: "01",
  name: {zh: "智能风控引擎", en: "Risk Control Engine"},
  category: {zh: "风控", en: "Risk"},
  color: "coffee",
  status: "live",
  launch: "2024-Q1",
  demoUrl: "https://example.com/demo",
  desc: {zh: "实时识别欺诈交易", en: "Realtime fraud detection"},
  features: {zh: ["规则引擎", "模型评分"], en: ["Rule engine", "Model scoring"]},
  isNew: true,
  isWatched: false,
};

describe("productMatchesQuery", () => {
  it("空查询或纯空白查询匹配所有产品", () => {
    expect(productMatchesQuery(product, "", "zh")).toBe(true);
    expect(productMatchesQuery(product, "   ", "en")).toBe(true);
  });

  it("按本地化名称匹配（中/英）", () => {
    expect(productMatchesQuery(product, "风控", "zh")).toBe(true);
    expect(productMatchesQuery(product, "risk", "en")).toBe(true);
  });

  it("按原始中英文字段匹配（不依赖 locale）", () => {
    // 即使 locale=en，name.zh 仍参与匹配
    expect(productMatchesQuery(product, "引擎", "en")).toBe(true);
    // 即使 locale=zh，name.en 仍参与匹配
    expect(productMatchesQuery(product, "Engine", "zh")).toBe(true);
  });

  it("按描述匹配（本地化字段）", () => {
    expect(productMatchesQuery(product, "欺诈", "zh")).toBe(true);
    expect(productMatchesQuery(product, "fraud", "en")).toBe(true);
  });

  it("按分类匹配（本地化字段）", () => {
    expect(productMatchesQuery(product, "风控", "zh")).toBe(true);
    expect(productMatchesQuery(product, "risk", "en")).toBe(true);
  });

  it("按特性列表匹配（中/英，部分子串）", () => {
    expect(productMatchesQuery(product, "评分", "zh")).toBe(true);
    expect(productMatchesQuery(product, "scoring", "en")).toBe(true);
  });

  it("大小写不敏感", () => {
    expect(productMatchesQuery(product, "RISK CONTROL ENGINE", "en")).toBe(true);
  });

  it("无匹配字段时返回 false", () => {
    expect(productMatchesQuery(product, "量子计算", "zh")).toBe(false);
    expect(productMatchesQuery(product, "quantum", "en")).toBe(false);
  });
});
