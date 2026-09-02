// 单元测试：SiteAnalytics 依据环境变量注入百度统计 / GA4，未配置时返回 null。
// Unit test: SiteAnalytics injects Baidu Tongji / GA4 based on env vars; null when unconfigured.
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen} from "@testing-library/react";
import type {ReactNode} from "react";

// next/script 在 vitest 下按纯 DOM 渲染，便于断言注入内容。
// Render next/script as plain DOM in vitest to assert injected content.
vi.mock("next/script", () => ({
  default: ({children, src, id}: {children?: ReactNode; src?: string; id?: string}) => (
    <script data-testid={`script-${id ?? "anon"}`} src={src}>
      {typeof children === "string" ? children : null}
    </script>
  ),
}));

// 环境变量在模块顶层读取，故每个用例都要重置模块缓存后重新 import。
// Env vars are read at module scope, so reset module cache before each dynamic import.
async function loadAnalytics() {
  vi.resetModules();
  const mod = await import("@/components/analytics");
  return mod.default;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_BAIDU_TONGJI_ID", undefined);
  vi.stubEnv("NEXT_PUBLIC_GA_ID", undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("SiteAnalytics", () => {
  it("未配置任何统计 ID 时返回 null，不注入任何脚本", async () => {
    const SiteAnalytics = await loadAnalytics();
    const {container} = render(<SiteAnalytics />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId(/script-/)).not.toBeInTheDocument();
  });

  it("仅配置百度统计时注入 baidu-tongji 脚本与 no-JS 兜底像素", async () => {
    vi.stubEnv("NEXT_PUBLIC_BAIDU_TONGJI_ID", "abc123");
    const SiteAnalytics = await loadAnalytics();
    const {container} = render(<SiteAnalytics />);
    const baiduScript = screen.getByTestId("script-baidu-tongji");
    expect(baiduScript).toBeInTheDocument();
    expect(baiduScript.textContent).toContain("hm.js?abc123");
    // noscript 兜底标记存在（jsdom 客户端渲染下 noscript 子节点不会解析进 DOM，只断言标记本身）
    // No-JS fallback noscript is present (jsdom client render won't parse noscript children into DOM, assert the tag only).
    expect(container.querySelector("noscript")).toBeTruthy();
    // 未注入 GA
    expect(screen.queryByTestId("script-ga-gtag")).not.toBeInTheDocument();
  });

  it("仅配置 GA 时注入 gtag 外链与配置脚本", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-XXXXXXX");
    const SiteAnalytics = await loadAnalytics();
    const {container} = render(<SiteAnalytics />);
    const gaSrc = screen.getByTestId("script-ga-gtag");
    expect(gaSrc).toBeInTheDocument();
    expect(gaSrc.textContent).toContain("gtag('config', 'G-XXXXXXX')");
    // 百度统计未配置时不注入
    expect(screen.queryByTestId("script-baidu-tongji")).not.toBeInTheDocument();
    expect(container.querySelector("noscript")).not.toBeInTheDocument();
  });

  it("同时配置两个统计时均注入", async () => {
    vi.stubEnv("NEXT_PUBLIC_BAIDU_TONGJI_ID", "abc123");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-YYYYYYY");
    const SiteAnalytics = await loadAnalytics();
    render(<SiteAnalytics />);
    expect(screen.getByTestId("script-baidu-tongji")).toBeInTheDocument();
    expect(screen.getByTestId("script-ga-gtag")).toBeInTheDocument();
  });
});
