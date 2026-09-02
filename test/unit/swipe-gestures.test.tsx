// 单元测试：SwipeGestures 全站手势（快速上下滑动直达顶部/底部）。
// Unit test: SwipeGestures global gesture (fast vertical flick jumps to top/bottom).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, cleanup} from "@testing-library/react";
import SwipeGestures from "@/components/swipe-gestures";

// jsdom 未实现 TouchEvent 构造器，手造事件挂上触摸列表。
// jsdom lacks a TouchEvent constructor, so we build events and attach touch lists.
function fireWindowTouch(
  type: "touchstart" | "touchend",
  points: {clientY: number}[],
): void {
  const evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(
    evt,
    type === "touchstart"
      ? {touches: points}
      : {changedTouches: points, touches: []},
  );
  window.dispatchEvent(evt);
}

/** 竖直滑动（可指定耗时以模拟速度）/ Vertical swipe (duration simulates velocity). */
function swipeVertical(dy: number, elapsedMs = 10): void {
  const start = 300;
  // 用 Date.now 控制耗时，从而决定速度是否达标。
  // Drive Date.now so we control elapsed time and therefore the velocity.
  // 使用 mockReturnValue 而非 mockReturnValueOnce，因为事件创建/分发过程
  // 中的内部调用会消耗 once 值，导致组件 handler 拿到 undefined。
  // Use mockReturnValue instead of mockReturnValueOnce because internal calls
  // during event creation/dispatch consume the once values.
  const nowSpy = vi.spyOn(Date, "now");
  nowSpy.mockReturnValue(0);
  fireWindowTouch("touchstart", [{clientY: start}]);
  nowSpy.mockReturnValue(elapsedMs);
  fireWindowTouch("touchend", [{clientY: start + dy}]);
  nowSpy.mockRestore();
}

beforeEach(() => {
  // jsdom 未实现 window.scrollTo / jsdom does not implement window.scrollTo.
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("SwipeGestures", () => {
  it("快速大幅向下滑动 → 回到顶部（scrollTo 0）", () => {
    render(<SwipeGestures />);
    swipeVertical(300);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({top: 0, behavior: "smooth"});
  });

  it("快速大幅向上滑动 → 去底部（scrollTo scrollHeight）", () => {
    render(<SwipeGestures />);
    swipeVertical(-300);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  });

  it("位移不足（<140px）不触发", () => {
    render(<SwipeGestures />);
    swipeVertical(100);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("速度不足（慢速拖动）不触发，避免劫持普通滚动", () => {
    render(<SwipeGestures />);
    // 300px 用了 10000ms → 0.03 px/ms，远低于 0.45 阈值。
    // 300px in 10000ms → 0.03 px/ms, well under the 0.45 threshold.
    swipeVertical(300, 10000);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("多指（如缩放）不参与手势", () => {
    render(<SwipeGestures />);
    fireWindowTouch("touchstart", [{clientY: 300}, {clientY: 320}]);
    fireWindowTouch("touchend", [{clientY: 600}]);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("弹窗打开时不接管，交给弹窗自己的手势处理", () => {
    render(<SwipeGestures />);
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.appendChild(dialog);

    swipeVertical(300);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("卸载后移除监听，不再响应手势", () => {
    const {unmount} = render(<SwipeGestures />);
    unmount();
    swipeVertical(300);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
