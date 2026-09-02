"use client";

import {useRef, type TouchEvent as ReactTouchEvent} from "react";

// 触屏滑动手势识别（仅移动端生效：桌面端鼠标不会产生 touch 事件，因此桌面行为不变）。
// Touch swipe detection — mobile only. Desktop mice emit no touch events, so desktop behaviour is untouched.

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** 触发所需的最小位移（px）/ Minimum travel distance (px) to trigger. */
  threshold?: number;
  /** 主轴锁定比例：|dx| > axisLock * |dy| 才判定为横向 / Axis lock ratio for horizontal. */
  axisLock?: number;
}

/** 返回可直接展开到元素上的 touch 事件处理器。/ Returns touch handlers to spread onto an element. */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 60,
  axisLock = 1.2,
}: SwipeOptions) {
  const start = useRef<{x: number; y: number} | null>(null);

  const onTouchStart = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    start.current = {x: touch.clientX, y: touch.clientY};
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    const s = start.current;
    start.current = null;
    const touch = e.changedTouches[0];
    if (!s || !touch) return;

    const dx = touch.clientX - s.x;
    const dy = touch.clientY - s.y;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy) * axisLock) {
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    } else if (Math.abs(dy) > Math.abs(dx) * axisLock) {
      if (dy > 0) onSwipeDown?.();
      else onSwipeUp?.();
    }
  };

  return {onTouchStart, onTouchEnd};
}
