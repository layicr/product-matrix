// 组件测试：FilterBar 渲染筛选项、计数（插值）与点击回调。
// Component test: FilterBar renders filters, count (interpolation) and click callbacks.
import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import FilterBar from "@/components/filter-bar";

describe("FilterBar", () => {
  it("渲染筛选标签与计数（含插值 count）", () => {
    renderWithIntl(
      <FilterBar activeFilter="all" onFilterChange={() => {}} count={6} />,
      {locale: "zh"},
    );
    expect(screen.getByText("筛选 →")).toBeInTheDocument();
    expect(screen.getByText("全部")).toBeInTheDocument();
    expect(screen.getByText("🚀 已上线")).toBeInTheDocument();
    expect(screen.getByText("⏳ 即将上线")).toBeInTheDocument();
    expect(screen.getByText("💡 规划中")).toBeInTheDocument();
    expect(screen.getByText("共 6 张便签")).toBeInTheDocument();
  });

  it("英文 locale 渲染英文筛选项与计数", () => {
    renderWithIntl(
      <FilterBar activeFilter="all" onFilterChange={() => {}} count={3} />,
      {locale: "en"},
    );
    expect(screen.getByText("Filter →")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("3 sticky notes")).toBeInTheDocument();
  });

  it("点击筛选项回调对应 key", () => {
    const onFilterChange = vi.fn();
    renderWithIntl(
      <FilterBar activeFilter="all" onFilterChange={onFilterChange} count={6} />,
      {locale: "zh"},
    );
    fireEvent.click(screen.getByText("🚀 已上线"));
    expect(onFilterChange).toHaveBeenCalledWith("live");
    fireEvent.click(screen.getByText("💡 规划中"));
    expect(onFilterChange).toHaveBeenCalledWith("planned");
  });

  it("当前激活项带激活样式", () => {
    renderWithIntl(
      <FilterBar activeFilter="soon" onFilterChange={() => {}} count={6} />,
      {locale: "zh"},
    );
    const active = screen.getByText("⏳ 即将上线");
    expect(active.className).toContain("bg-ink");
  });
});
