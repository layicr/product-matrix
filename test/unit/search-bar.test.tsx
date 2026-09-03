// 组件测试：SearchBar 的本地化 placeholder、受控输入与清除按钮。
// Component test: SearchBar localized placeholder, controlled input and clear button.
import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import SearchBar from "@/components/search-bar";

describe("SearchBar", () => {
  it("渲染带本地化 placeholder 的输入框", () => {
    renderWithIntl(<SearchBar value="" onChange={() => {}} />, {locale: "zh"});
    expect(
      screen.getByPlaceholderText("搜索产品、功能、分类..."),
    ).toBeInTheDocument();
  });

  it("英文 locale 渲染英文 placeholder", () => {
    renderWithIntl(<SearchBar value="" onChange={() => {}} />, {locale: "en"});
    expect(
      screen.getByPlaceholderText("Search products, features, categories..."),
    ).toBeInTheDocument();
  });

  it("输入时回调最新值", () => {
    const onChange = vi.fn();
    renderWithIntl(<SearchBar value="" onChange={onChange} />, {locale: "zh"});
    const input = screen.getByPlaceholderText(
      "搜索产品、功能、分类...",
    ) as HTMLInputElement;
    fireEvent.change(input, {target: {value: "风控"}});
    expect(onChange).toHaveBeenCalledWith("风控");
  });

  it("有值时显示清除按钮，点击后清空", () => {
    const onChange = vi.fn();
    renderWithIntl(<SearchBar value="abc" onChange={onChange} />, {locale: "zh"});
    const clearBtn = screen.getByLabelText("清除搜索");
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });
});
