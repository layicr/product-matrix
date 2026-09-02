// 集成测试：HomeClient 状态逻辑（Hero 统计 / 搜索 / 状态筛选 / 弹窗 / 滑动手势）。
// Integration test: HomeClient state logic (Hero stats / search / status filter / dialog / swipe).
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, fireEvent, within} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import HomeClient from "@/components/home-client";
import type {Product} from "@/lib/types";

// Navbar 依赖 next-intl/navigation，与 navbar.test.tsx 采用相同 mock 策略。
// Navbar depends on next-intl/navigation; same mock strategy as navbar.test.tsx.
vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({
    Link: ({href, children, className, ...rest}: {href: string; children: React.ReactNode; className?: string}) => (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a href={href} className={className} {...rest}>{children}</a>
    ),
    redirect: () => undefined,
    usePathname: () => "/",
    useRouter: () => ({push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn()}),
    getPathname: () => "/",
  }),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p0001",
    num: "01",
    name: {zh: "智能风控引擎", en: "Risk Control Engine"},
    category: {zh: "风控", en: "Risk"},
    color: "coffee",
    status: "live",
    launch: "2024-Q1",
    demoUrl: "https://example.com/demo",
    desc: {zh: "中文描述", en: "English description"},
    features: {zh: ["特性一"], en: ["Feature one"]},
    isNew: true,
    isWatched: false,
    ...overrides,
  };
}

// 固定样本：2 live + 1 soon + 1 planned + 1 archived。
// Fixture: 2 live + 1 soon + 1 planned + 1 archived.
const products = [
  makeProduct({id: "p01", name: {zh: "智能风控引擎", en: "Risk Engine"}, category: {zh: "风控", en: "Risk"}, status: "live"}),
  makeProduct({id: "p02", name: {zh: "数据看板", en: "Data Board"}, category: {zh: "风控", en: "Risk"}, status: "live"}),
  makeProduct({id: "p03", name: {zh: "智能推荐", en: "Recommender"}, category: {zh: "增长", en: "Growth"}, status: "soon"}),
  makeProduct({id: "p04", name: {zh: "灵感便签", en: "Idea Pad"}, category: {zh: "效率", en: "Productivity"}, status: "planned"}),
  makeProduct({id: "p05", name: {zh: "旧版门户", en: "Legacy Portal"}, category: {zh: "其他", en: "Other"}, status: "archived"}),
];

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.open = vi.fn() as unknown as typeof window.open;
});

describe("HomeClient", () => {
  it("初始渲染显示全部产品，Hero 统计为服务端一致的核心数/已上线数", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    // 全部 5 个产品均可见（all 筛选取值含 archived）
    for (const p of products) {
      expect(screen.getByText(p.name.zh)).toBeInTheDocument();
    }
    // 核心产品 = live(2) + soon(1) = 3；已上线 = 2
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    // FilterBar 计数 = 过滤后数量
    expect(screen.getByText("共 5 张便签")).toBeInTheDocument();
  });

  it("搜索关键词只保留匹配产品", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    fireEvent.change(screen.getByRole("textbox"), {target: {value: "风控"}});
    expect(screen.getByText("智能风控引擎")).toBeInTheDocument();
    expect(screen.getByText("数据看板")).toBeInTheDocument();
    expect(screen.queryByText("智能推荐")).not.toBeInTheDocument();
    expect(screen.queryByText("灵感便签")).not.toBeInTheDocument();
    expect(screen.getByText("共 2 张便签")).toBeInTheDocument();
  });

  it("点击状态筛选只保留对应状态产品", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    // 产品卡片上的状态徽章也含「已上线」文案，需限定到筛选按钮再点击。
    // The status badge on product cards shares the text, so scope to the filter button.
    fireEvent.click(screen.getByRole("button", {name: /已上线/}));
    expect(screen.getByText("智能风控引擎")).toBeInTheDocument();
    expect(screen.getByText("数据看板")).toBeInTheDocument();
    expect(screen.queryByText("智能推荐")).not.toBeInTheDocument();
    expect(screen.getByText("共 2 张便签")).toBeInTheDocument();
  });

  it("点击产品卡片打开弹窗，展示本地化详情", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    fireEvent.click(screen.getByText("智能风控引擎"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // 弹窗标题 = 产品名；描述与特性进入弹窗（卡片与弹窗同文案，需限定到 dialog）
    // Dialog title is the product name; desc & features are inside (both card & dialog share text, so scope to dialog).
    expect(within(dialog).getByText("智能风控引擎")).toBeInTheDocument();
    expect(within(dialog).getByText("中文描述")).toBeInTheDocument();
    expect(within(dialog).getByText("特性一")).toBeInTheDocument();
  });

  it("左右滑动切换筛选分类（touch 事件驱动）", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    const main = screen.getByRole("main");
    // all → live：左滑
    fireEvent.touchStart(main, {touches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchEnd(main, {changedTouches: [{clientX: 100, clientY: 200}]});
    expect(screen.queryByText("智能推荐")).not.toBeInTheDocument();
    expect(screen.getByText("智能风控引擎")).toBeInTheDocument();
    // live → soon：继续左滑
    fireEvent.touchStart(main, {touches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchEnd(main, {changedTouches: [{clientX: 100, clientY: 200}]});
    expect(screen.queryByText("数据看板")).not.toBeInTheDocument();
    expect(screen.getByText("智能推荐")).toBeInTheDocument();
  });

  it("右滑从当前筛选回退到上一个分类", () => {
    renderWithIntl(<HomeClient products={products} />, {locale: "zh"});
    const main = screen.getByRole("main");
    // all → live
    fireEvent.touchStart(main, {touches: [{clientX: 100, clientY: 200}]});
    fireEvent.touchEnd(main, {changedTouches: [{clientX: 300, clientY: 200}]});
    // 右滑应停在 all（首个分类不回退），全部产品仍在
    expect(screen.getByText("旧版门户")).toBeInTheDocument();
  });
});
