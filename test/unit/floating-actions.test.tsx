// 组件测试：FloatingActions 反馈入口与返回顶部（含滚动显隐与点击行为）。
// Component test: FloatingActions feedback link & back-to-top (scroll visibility & click behavior).
import {describe, it, expect, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import FloatingActions from "@/components/floating-actions";
import {siteConfig} from "@/lib/site-config";

describe("FloatingActions", () => {
  beforeEach(() => {
    // jsdom 未实现 window.open / window.scrollTo，替换为可断言的 mock。
    // jsdom doesn't implement window.open/scrollTo; replace with assertable mocks.
    (window as unknown as {open: ReturnType<typeof vi.fn>}).open = vi.fn();
    (window as unknown as {scrollTo: ReturnType<typeof vi.fn>}).scrollTo = vi.fn();
    Object.defineProperty(window, "scrollY", {value: 0, configurable: true});
  });

  it("渲染反馈与返回顶部两个按钮（均带 aria-label）", () => {
    renderWithIntl(<FloatingActions />, {locale: "zh"});
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("aria-label");
    expect(buttons[1]).toHaveAttribute("aria-label");
  });

  it("点击反馈按钮打开 issuesUrl", () => {
    renderWithIntl(<FloatingActions />, {locale: "zh"});
    const feedback = screen.getAllByRole("button")[0];
    fireEvent.click(feedback);
    expect((window as unknown as {open: ReturnType<typeof vi.fn>}).open).toHaveBeenCalledWith(
      siteConfig.issuesUrl,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("滚动超过 200 时返回顶部按钮可见，点击触发 scrollTo", () => {
    renderWithIntl(<FloatingActions />, {locale: "zh"});
    const backToTop = screen.getAllByRole("button")[1];
    // 初始 scrollY=0：返回顶部按钮隐藏（opacity-0）
    expect(backToTop.className).toContain("opacity-0");

    // 组件已在 mount 时挂载 scroll 监听；触发滚动后由自身状态更新显隐（无需 rerender）。
    // The component attaches a scroll listener on mount; firing scroll updates visibility via state.
    Object.defineProperty(window, "scrollY", {value: 300, configurable: true});
    fireEvent.scroll(window);

    const backToTopAfter = screen.getAllByRole("button")[1];
    expect(backToTopAfter.className).toContain("opacity-100");
    fireEvent.click(backToTopAfter);
    expect(
      (window as unknown as {scrollTo: ReturnType<typeof vi.fn>}).scrollTo,
    ).toHaveBeenCalled();
  });
});
