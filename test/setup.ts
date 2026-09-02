// Vitest 测试环境配置：补齐 jsdom 缺失的浏览器 API 并 mock framer-motion。
// Vitest setup: polyfill missing browser APIs in jsdom and mock framer-motion.
import "@testing-library/jest-dom/vitest";
import {vi} from "vitest";
import React from "react";

// jsdom 下补齐组件库/动画库依赖的浏览器 API / Polyfill browser APIs required by component/animation libs under jsdom.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

if (!(window as unknown as {ResizeObserver?: unknown}).ResizeObserver) {
  (window as unknown as {ResizeObserver: unknown}).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// 让 framer-motion 在 jsdom 下渲染为基础 DOM 元素，避免动画/布局测量报错 / Render framer-motion as plain DOM in jsdom to avoid animation/layout measurement errors.
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Comp = (props: Record<string, unknown>) => {
          const {children, ...rest} = props;
          return React.createElement(tag, rest, children);
        };
        return Comp;
      },
    },
  ),
  AnimatePresence: ({children}: {children?: React.ReactNode}) =>
    React.createElement(React.Fragment, null, children),
}));
