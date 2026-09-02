// 组件测试：app/not-found 根级 404 页面（自包含 i18n 兜底 + 回首页链接）。
// Component test: app/not-found root 404 page (self-contained i18n fallback + home link).
import {describe, it, expect, vi, afterEach} from "vitest";
import {render, screen, cleanup} from "@testing-library/react";
import NotFoundPage from "@/app/not-found";

// 根级边界内的 LocaleSync 依赖 usePathname，测试环境无 App Router 上下文。
// Root boundary embeds LocaleSync which reads usePathname; mock it for the test env.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("app/not-found 根级 404", () => {
  it("渲染 404 代码、标题与描述（自包含 i18n）", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("页面未找到")).toBeInTheDocument();
    expect(
      screen.getByText("您访问的页面不存在或已被移除。请返回首页继续浏览产品矩阵。"),
    ).toBeInTheDocument();
  });

  it("「返回首页」链接指向默认语言首页 /zh", () => {
    render(<NotFoundPage />);
    const back = screen.getByRole("link", {name: "返回首页"});
    expect(back).toHaveAttribute("href", "/zh");
  });
});
