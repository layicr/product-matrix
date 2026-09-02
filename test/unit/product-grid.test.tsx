// 组件测试：ProductGrid 按分类分组渲染卡片、分组计数与空状态。
// Component test: ProductGrid groups cards by category, shows counts and empty state.
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import ProductGrid from "@/components/product-grid";
import type {Product} from "@/lib/types";

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

describe("ProductGrid", () => {
  it("按分类分组并展示分组内数量", () => {
    const products = [
      makeProduct({id: "p0001", category: {zh: "风控", en: "Risk"}}),
      makeProduct({id: "p0002", category: {zh: "风控", en: "Risk"}}),
      makeProduct({id: "p0003", category: {zh: "营销", en: "Growth"}}),
    ];
    renderWithIntl(<ProductGrid products={products} onProductClick={() => {}} />, {
      locale: "zh",
    });
    // 两个分类标题
    expect(screen.getByText("风控")).toBeInTheDocument();
    expect(screen.getByText("营销")).toBeInTheDocument();
    // 单个分类计数（2 items）
    expect(screen.getByText("2 items")).toBeInTheDocument();
    // 共 3 张卡片（article 容器）
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("点击卡片触发 onProductClick 并回传该产品", () => {
    const onClick = vi.fn();
    const products = [makeProduct({id: "p0001"})];
    renderWithIntl(<ProductGrid products={products} onProductClick={onClick} />, {
      locale: "zh",
    });
    screen.getByText("智能风控引擎").click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(products[0]);
  });

  it("空产品列表渲染空状态（无卡片）", () => {
    renderWithIntl(<ProductGrid products={[]} onProductClick={() => {}} />, {
      locale: "zh",
    });
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    // 空状态含标题与描述两段提示
    expect(screen.getAllByRole("paragraph")).toHaveLength(2);
  });
});
