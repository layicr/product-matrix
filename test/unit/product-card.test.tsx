// 组件测试：ProductCard 按 locale 渲染本地化字段、状态标签与点击。
// Component test: ProductCard renders localized fields, status tag and click handler per locale.
import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import ProductCard from "@/components/product-card";
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
  features: {zh: ["特性一"], en: ["Feature one"]},
  isNew: true,
  isWatched: false,
};

describe("ProductCard", () => {
  it("按当前 locale 渲染本地化名称与描述", () => {
    renderWithIntl(<ProductCard product={product} index={0} onClick={() => {}} />, {
      locale: "zh",
    });
    expect(screen.getByText("智能风控引擎")).toBeInTheDocument();
    expect(screen.getByText("中文描述")).toBeInTheDocument();
  });

  it("英文 locale 渲染英文字段与状态标签", () => {
    renderWithIntl(<ProductCard product={product} index={0} onClick={() => {}} />, {
      locale: "en",
    });
    expect(screen.getByText("Risk Control Engine")).toBeInTheDocument();
    expect(screen.getByText("English description")).toBeInTheDocument();
    // status.live 标签
    expect(screen.getByText("🚀 Live")).toBeInTheDocument();
  });

  it("渲染上线时间 tag", () => {
    renderWithIntl(<ProductCard product={product} index={0} onClick={() => {}} />, {
      locale: "zh",
    });
    expect(screen.getByText("2024-Q1")).toBeInTheDocument();
  });

  it("点击卡片触发 onClick", () => {
    const onClick = vi.fn();
    renderWithIntl(<ProductCard product={product} index={0} onClick={onClick} />, {
      locale: "zh",
    });
    fireEvent.click(screen.getByText("智能风控引擎"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("渲染为 article 容器", () => {
    const {container} = renderWithIntl(
      <ProductCard product={product} index={0} onClick={() => {}} />,
      {locale: "zh"},
    );
    expect(container.querySelector("article")).toBeTruthy();
  });
});
