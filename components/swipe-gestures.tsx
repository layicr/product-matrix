"use client";

import {useEffect} from "react";

// 全站手势（仅触屏）：快速上下滑动可直达页面顶部 / 底部。
// Site-wide touch gesture: a fast vertical flick jumps straight to the top / bottom of the page.
//
// 之所以要求“快速 + 大位移”，是为了和普通滚动区分开：
// 慢速拖动或小幅滑动不会被接管，仍然走浏览器原生滚动。
// Requiring both high velocity and long travel keeps it from hijacking ordinary scrolling.

const MIN_DISTANCE = 140; // 最小位移 px / minimum travel in px
const MIN_VELOCITY = 0.45; // 最小速度 px/ms / minimum speed in px/ms

export default function SwipeGestures() {
  useEffect(() => {
    let startY = 0;
    let startTime = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      // 弹窗打开时不接管，交给弹窗自己的手势处理。
      // Skip while a dialog is open — let the dialog handle its own gestures.
      if (document.querySelector('[role="dialog"]')) {
        tracking = false;
        return;
      }
      // 多指（如缩放）不参与 / Ignore multi-touch (e.g. pinch zoom).
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      tracking = true;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dy = touch.clientY - startY;
      const elapsed = Math.max(Date.now() - startTime, 1);
      if (Math.abs(dy) < MIN_DISTANCE) return;
      if (Math.abs(dy) / elapsed < MIN_VELOCITY) return;

      // 手指向下划 = 内容向上走 → 回到顶部；反之去底部。
      // Finger down = content moves up → jump to top; the opposite goes to the bottom.
      const target = dy > 0 ? 0 : document.documentElement.scrollHeight;
      window.scrollTo({top: target, behavior: "smooth"});
    };

    window.addEventListener("touchstart", onTouchStart, {passive: true});
    window.addEventListener("touchend", onTouchEnd, {passive: true});
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}
