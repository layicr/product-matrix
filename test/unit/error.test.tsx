// 组件测试：app/error 根级错误边界（自包含 i18n 兜底 + 重试/回首页）。
// Component test: app/error root error boundary (self-contained i18n fallback + retry/home).
import {describe, it, expect, vi, afterEach} from "vitest";
import {render, screen, cleanup, fireEvent} from "@testing-library/react";
import ErrorPage from "@/app/error";

// 根级边界内的 LocaleSync 依赖 usePathname，测试环境无 App Router 上下文。
// Root boundary embeds LocaleSync which reads usePathname; mock it for the test env.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const error = Object.assign(new Error("boom"), {digest: "abc123"});

describe("app/error 根级错误边界", () => {
  it("渲染错误标题与描述（自包含 i18n，无需 [lang] provider）", () => {
    // 抑制组件内部 console.error 副作用（错误边界日志）。
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText("哎呀，出错了！")).toBeInTheDocument();
    expect(screen.getByText("页面加载时遇到了一点小问题")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("开发环境下展示错误详情与 digest", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const prev = process.env.NODE_ENV;
    // @ts-expect-error 仅测试内临时改写环境标记。
    process.env.NODE_ENV = "development";
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText("boom")).toBeInTheDocument();
    expect(screen.getByText(/Digest: abc123/)).toBeInTheDocument();
    process.env.NODE_ENV = prev;
    spy.mockRestore();
  });

  it("点击「重新加载」触发 reset", () => {
    const reset = vi.fn();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={error} reset={reset} />);
    fireEvent.click(screen.getByRole("button", {name: "重新加载"}));
    expect(reset).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("「返回首页」链接指向当前语言首页（默认 zh）", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={error} reset={() => {}} />);
    const home = screen.getByRole("link", {name: "返回首页"});
    expect(home).toHaveAttribute("href", "/zh");
    spy.mockRestore();
  });
});
