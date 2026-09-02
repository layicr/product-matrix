// 组件测试：LocaleSync 根据 URL 路径同步 <html lang>（SSR zh-CN 与客户端语言一致）。
// Component test: LocaleSync syncs <html lang> from the URL path (SSR zh-CN aligns with client locale).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, cleanup} from "@testing-library/react";
import {LocaleSync} from "@/lib/locale-sync";

// Mock next/navigation 的 usePathname，避免真实 Router 依赖。
// Mock next/navigation's usePathname to avoid real Router dependency.
const pathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
}));

beforeEach(() => {
  pathname.mockReturnValue("/");
  document.documentElement.lang = "zh-CN";
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.lang = "";
});

describe("LocaleSync", () => {
  it("en 路径将 <html lang> 同步为 en", () => {
    pathname.mockReturnValue("/en/products/p0001");
    render(<LocaleSync />);
    expect(document.documentElement.lang).toBe("en");
  });

  it("zh 路径将 <html lang> 同步为 zh-CN", () => {
    pathname.mockReturnValue("/zh/about");
    render(<LocaleSync />);
    expect(document.documentElement.lang).toBe("zh-CN");
  });

  it("无语言前缀路径回退为 zh-CN", () => {
    pathname.mockReturnValue("/");
    render(<LocaleSync />);
    expect(document.documentElement.lang).toBe("zh-CN");
  });

  it("未知前缀路径回退为 zh-CN（不破坏页面）", () => {
    pathname.mockReturnValue("/fr/x");
    render(<LocaleSync />);
    expect(document.documentElement.lang).toBe("zh-CN");
  });

  it("渲染为空节点（不产生额外 DOM）", () => {
    const {container} = render(<LocaleSync />);
    expect(container.firstChild).toBeNull();
  });
});
