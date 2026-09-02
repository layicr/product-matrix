// 单元测试：app/sitemap 动态生成（多语言 hreflang、live 优先级、DB 异常降级）。
// Unit test: app/sitemap dynamic generation (multi-locale hreflang, live priority, DB-failure fallback).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";

// Mock unstable_cache：测试环境缺少 incrementalCache，直接透传原始函数。
// Mock unstable_cache: test env lacks incrementalCache, pass through to original function.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, _key?: unknown, _opts?: unknown) => fn,
}));

import {setDb} from "@/lib/db";
import sitemap from "@/app/sitemap";

const mockClient = {
  execute: vi.fn(),
};

function makeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "p0001",
    num: "01",
    name_zh: "智能风控引擎",
    name_en: "Risk Control Engine",
    category_zh: "风控",
    category_en: "Risk",
    color: "coffee",
    status: "live",
    launch: "2024-Q1",
    demo_url: "https://example.com/demo",
    desc_zh: "中文描述",
    desc_en: "English desc",
    features_zh: JSON.stringify(["特性一"]),
    features_en: JSON.stringify(["Feature one"]),
    is_new: 1,
    is_watched: 0,
    ...overrides,
  };
}

describe("app/sitemap", () => {
  beforeEach(() => {
    setDb(mockClient as unknown as never);
  });

  afterEach(() => {
    mockClient.execute.mockReset();
    setDb(null);
    vi.restoreAllMocks();
  });

  it("为每个 locale 生成首页、关于页与产品详情页条目", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [makeRow(), makeRow({id: "p0002", num: "02", status: "soon"})],
      rowsAffected: 2,
    } as never);

    const entries = await sitemap();
    // 2 locales × (首页 + 关于页 + 2 产品) = 8 条
    expect(entries).toHaveLength(8);

    const urls = entries.map((e) => e.url);
    // 每个 locale 都有首页与关于页
    for (const lang of ["zh", "en"]) {
      expect(urls.some((u) => u.endsWith(`/${lang}`))).toBe(true);
      expect(urls.some((u) => u.endsWith(`/${lang}/about`))).toBe(true);
      expect(urls.some((u) => u.endsWith(`/${lang}/products/p0001`))).toBe(true);
      expect(urls.some((u) => u.endsWith(`/${lang}/products/p0002`))).toBe(true);
    }
  });

  it("每个条目都是绝对 URL 且携带完整 hreflang 组", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [makeRow()],
      rowsAffected: 1,
    } as never);

    const entries = await sitemap();
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.alternates?.languages).toHaveProperty("zh");
      expect(entry.alternates?.languages).toHaveProperty("en");
      expect(entry.alternates?.languages).toHaveProperty("x-default");
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it("live 产品使用 monthly/0.8，未上线产品使用 weekly/0.6", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [makeRow({id: "live1", status: "live"}), makeRow({id: "soon1", status: "soon"})],
      rowsAffected: 2,
    } as never);

    const entries = await sitemap();
    const live = entries.filter((e) => e.url.includes("/products/live1"));
    const soon = entries.filter((e) => e.url.includes("/products/soon1"));
    expect(live).toHaveLength(2);
    expect(soon).toHaveLength(2);
    for (const entry of live) {
      expect(entry.changeFrequency).toBe("monthly");
      expect(entry.priority).toBe(0.8);
    }
    for (const entry of soon) {
      expect(entry.changeFrequency).toBe("weekly");
      expect(entry.priority).toBe(0.6);
    }
  });

  it("DB 异常时降级为空产品列表，仍输出首页/关于页（不整份 500）", async () => {
    const err = new Error("db down");
    mockClient.execute.mockRejectedValue(err);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const entries = await sitemap();
    // 2 locales × (首页 + 关于页) = 4 条，无任何产品条目
    expect(entries).toHaveLength(4);
    expect(entries.some((e) => e.url.includes("/products/"))).toBe(false);
    spy.mockRestore();
  });
});
