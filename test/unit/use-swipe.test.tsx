// 单元测试：useSwipe 手势识别（方向判定、阈值、主轴锁定）。
// Unit test: useSwipe gesture detection (direction, threshold, axis lock).
import {describe, it, expect, vi, afterEach} from "vitest";
import {render, cleanup} from "@testing-library/react";
import {useSwipe, type SwipeOptions} from "@/lib/hooks/use-swipe";

// 探针组件：把 hook 返回的 handler 挂到元素上，便于派发事件。
// Probe component: attaches the hook's handlers to an element so we can dispatch events.
function SwipeProbe(props: SwipeOptions) {
  const swipe = useSwipe(props);
  return <div data-testid="area" {...swipe} />;
}

type Point = {clientX: number; clientY: number};

// jsdom 未实现 TouchEvent 构造器，这里手造事件并挂上 touches/changedTouches。
// jsdom lacks a TouchEvent constructor, so we build the event and attach the touch lists.
function fireTouch(
  el: Element,
  type: "touchstart" | "touchend",
  point: Point,
): void {
  const evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(
    evt,
    type === "touchstart"
      ? {touches: [point]}
      : {changedTouches: [point], touches: []},
  );
  el.dispatchEvent(evt);
}

/** 从 from 滑到 to / Swipe from -> to. */
function swipe(el: Element, from: Point, to: Point): void {
  fireTouch(el, "touchstart", from);
  fireTouch(el, "touchend", to);
}

afterEach(() => {
  cleanup();
});

describe("useSwipe", () => {
  it("向右滑动触发 onSwipeRight", () => {
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeRight={onSwipeRight} />);
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 100, clientY: 0});
    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it("向左滑动触发 onSwipeLeft", () => {
    const onSwipeLeft = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeLeft={onSwipeLeft} />);
    swipe(getByTestId("area"), {clientX: 100, clientY: 0}, {clientX: 0, clientY: 0});
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it("向下滑动触发 onSwipeDown", () => {
    const onSwipeDown = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeDown={onSwipeDown} />);
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 0, clientY: 100});
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it("向上滑动触发 onSwipeUp", () => {
    const onSwipeUp = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeUp={onSwipeUp} />);
    swipe(getByTestId("area"), {clientX: 0, clientY: 100}, {clientX: 0, clientY: 0});
    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  it("位移小于阈值时不触发任何回调", () => {
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeRight={onSwipeRight} />);
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 30, clientY: 0});
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("主轴锁定：纵向占优时只触发纵向回调，不误触横向", () => {
    const onSwipeDown = vi.fn();
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(
      <SwipeProbe onSwipeDown={onSwipeDown} onSwipeRight={onSwipeRight} />,
    );
    // dx=40, dy=200 → 纵向明显占优 / vertical clearly dominates.
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 40, clientY: 200});
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("斜向且未达 axisLock 比例时两个方向都不触发", () => {
    const onSwipeDown = vi.fn();
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(
      <SwipeProbe onSwipeDown={onSwipeDown} onSwipeRight={onSwipeRight} />,
    );
    // dx=100, dy=90：100 < 90*1.2 且 90 < 100*1.2 → 落在死区，均不触发。
    // Both comparisons fail the 1.2 axis-lock ratio, so this lands in the dead zone.
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 100, clientY: 90});
    expect(onSwipeDown).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("自定义 threshold 生效", () => {
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(
      <SwipeProbe onSwipeRight={onSwipeRight} threshold={200} />,
    );
    swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 100, clientY: 0});
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("未传回调时滑动不报错", () => {
    const {getByTestId} = render(<SwipeProbe />);
    expect(() =>
      swipe(getByTestId("area"), {clientX: 0, clientY: 0}, {clientX: 100, clientY: 0}),
    ).not.toThrow();
  });

  it("只有 touchend 而没有 touchstart 时不触发（起点缺失）", () => {
    const onSwipeRight = vi.fn();
    const {getByTestId} = render(<SwipeProbe onSwipeRight={onSwipeRight} />);
    fireTouch(getByTestId("area"), "touchend", {clientX: 100, clientY: 0});
    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});
