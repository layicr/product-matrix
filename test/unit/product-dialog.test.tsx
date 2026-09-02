// 组件测试：ProductDialog 详情弹窗（本地化字段、状态标签、演示链接、触摸手势关闭/切换）。
// Component test: ProductDialog detail dialog (localized fields, status tag, demo link, touch gestures).
import {describe, it, expect, vi, afterEach} from "vitest";
import {render, screen, cleanup, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import ProductDialog from "@/components/product-dialog";
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
  desc: {zh: "中文描述", en: "English description"},
  features: {zh: ["特性一", "特性二"], en: ["Feature one", "Feature two"]},
  isNew: true,
  isWatched: false,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProductDialog", () => {
  it("按 locale 渲染标题、描述与特性列表", () => {
    renderWithIntl(<ProductDialog product={product} onClose={() => {}} />, {
      locale: "zh",
    });
    expect(screen.getByText("智能风控引擎")).toBeInTheDocument();
    expect(screen.getByText("中文描述")).toBeInTheDocument();
    expect(screen.getByText("特性一")).toBeInTheDocument();
    expect(screen.getByText("特性二")).toBeInTheDocument();
  });

  it("英文 locale 渲染英文字段与状态标签", () => {
    renderWithIntl(<ProductDialog product={product} onClose={() => {}} />, {
      locale: "en",
    });
    expect(screen.getByText("Risk Control Engine")).toBeInTheDocument();
    expect(screen.getByText("Feature one")).toBeInTheDocument();
    expect(screen.getByText("🚀 Live")).toBeInTheDocument();
  });

  it("中文 locale 渲染「已上线」状态标签", () => {
    renderWithIntl(<ProductDialog product={product} onClose={() => {}} />, {
      locale: "zh",
    });
    expect(screen.getByText("🚀 已上线")).toBeInTheDocument();
  });

  it("演示链接指向 demoUrl 并在新窗口打开", () => {
    renderWithIntl(<ProductDialog product={product} onClose={() => {}} />, {
      locale: "zh",
    });
    const link = screen.getByRole("link", {name: "预约演示"});
    expect(link).toHaveAttribute("href", "https://example.com/demo");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("点击关闭按钮触发 onClose", () => {
    const onClose = vi.fn();
    renderWithIntl(<ProductDialog product={product} onClose={onClose} />, {
      locale: "zh",
    });
    // Radix Dialog 的关闭按钮带 "Close" 文本
    fireEvent.click(screen.getByRole("button", {name: "Close"}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("向下拖拽超过阈值触发 onClose", () => {
    const onClose = vi.fn();
    renderWithIntl(<ProductDialog product={product} onClose={onClose} />, {
      locale: "zh",
    });
    const dialog = screen.getByRole("dialog");
    // touch-pan-y：纵向仅在顶部且向下拖动时跟手；dragOffset = dy * 0.5 > 100 → 关闭。
    fireEvent.touchStart(dialog, {touches: [{clientX: 100, clientY: 100}]});
    fireEvent.touchMove(dialog, {touches: [{clientX: 100, clientY: 400}]});
    fireEvent.touchEnd(dialog, {
      touches: [],
      changedTouches: [{clientX: 100, clientY: 400}],
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("向左滑动超过阈值触发 onNavigate(1)（下一个产品）", () => {
    const onNavigate = vi.fn();
    renderWithIntl(
      <ProductDialog product={product} onClose={() => {}} onNavigate={onNavigate} />,
      {locale: "zh"},
    );
    const dialog = screen.getByRole("dialog");
    // 横向为主轴：dragX = dx * 0.4；dx=-300 → dragX=-120 < -70 → 左滑 → 下一个(1)。
    fireEvent.touchStart(dialog, {touches: [{clientX: 300, clientY: 100}]});
    fireEvent.touchMove(dialog, {touches: [{clientX: 0, clientY: 100}]});
    fireEvent.touchEnd(dialog, {
      touches: [],
      changedTouches: [{clientX: 0, clientY: 100}],
    });
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("向右滑动超过阈值触发 onNavigate(-1)（上一个产品）", () => {
    const onNavigate = vi.fn();
    renderWithIntl(
      <ProductDialog product={product} onClose={() => {}} onNavigate={onNavigate} />,
      {locale: "zh"},
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.touchStart(dialog, {touches: [{clientX: 0, clientY: 100}]});
    fireEvent.touchMove(dialog, {touches: [{clientX: 300, clientY: 100}]});
    fireEvent.touchEnd(dialog, {
      touches: [],
      changedTouches: [{clientX: 300, clientY: 100}],
    });
    expect(onNavigate).toHaveBeenCalledWith(-1);
  });

  it("小幅拖拽（未达阈值）不触发任何回调", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    renderWithIntl(
      <ProductDialog product={product} onClose={onClose} onNavigate={onNavigate} />,
      {locale: "zh"},
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.touchStart(dialog, {touches: [{clientX: 100, clientY: 100}]});
    fireEvent.touchMove(dialog, {touches: [{clientX: 130, clientY: 140}]});
    fireEvent.touchEnd(dialog, {
      touches: [],
      changedTouches: [{clientX: 130, clientY: 140}],
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
