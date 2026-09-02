// 组件测试：Hero 按 locale 渲染标题/副标题/统计与语义结构。
// Component test: Hero renders title/subtitle/stats per locale and semantic structure.
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import Hero from "@/components/hero";

describe("Hero", () => {
  it("按当前 locale 渲染标题与副标题", () => {
    renderWithIntl(<Hero productCount={4} liveCount={2} />, {locale: "zh"});
    expect(screen.getByText("产品矩阵")).toBeInTheDocument();
    expect(
      screen.getByText("所想即架构，所做即成型，即刻即赋能。"),
    ).toBeInTheDocument();
  });

  it("英文 locale 渲染英文文案", () => {
    renderWithIntl(<Hero productCount={4} liveCount={2} />, {locale: "en"});
    expect(screen.getByText("Product Matrix")).toBeInTheDocument();
    expect(
      screen.getByText(
        "What you conceive becomes architecture, what you build takes form in an instant, what you deliver empowers immediately.",
      ),
    ).toBeInTheDocument();
  });

  it("渲染统计标签，且核心产品数由 productCount 动态计算", () => {
    renderWithIntl(<Hero productCount={5} liveCount={2} />, {locale: "zh"});
    expect(screen.getByText("核心产品")).toBeInTheDocument();
    // 数字跟随 productCount 渲染，而非写死的 6 / Number follows productCount, not hardcoded 6.
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("已上线")).toBeInTheDocument();
    expect(screen.getByText("可能性")).toBeInTheDocument();
  });

  it("已上线数由 liveCount 动态渲染，而非写死的 3", () => {
    // 回归测试：此前 Hero 里「已上线」是硬编码的 3，产品状态变化后不会更新。
    // Regression: the "live" stat used to be hardcoded to 3 and never followed status changes.
    renderWithIntl(<Hero productCount={6} liveCount={4} />, {locale: "zh"});
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("liveCount 为 0 时渲染 0", () => {
    renderWithIntl(<Hero productCount={6} liveCount={0} />, {locale: "zh"});
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("渲染为 section 且含主标题 h1", () => {
    const {container} = renderWithIntl(
      <Hero productCount={4} liveCount={2} />,
      {locale: "zh"},
    );
    expect(container.querySelector("section")).toBeTruthy();
    expect(container.querySelector("h1")).toBeTruthy();
  });
});
