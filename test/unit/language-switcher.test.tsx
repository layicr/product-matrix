// 组件测试：LanguageSwitcher 在保留 pathname 前提下切换语言。
// Component test: LanguageSwitcher switches locale while preserving the pathname.
import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import LanguageSwitcher from "@/components/language-switcher";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/products/p0001",
  useRouter: () => ({replace, push: vi.fn(), prefetch: vi.fn()}),
}));

describe("LanguageSwitcher", () => {
  it("渲染中/英切换按钮", () => {
    renderWithIntl(<LanguageSwitcher />, {locale: "zh"});
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("点击 zh 按钮时切换到 zh（带当前 pathname）", () => {
    renderWithIntl(<LanguageSwitcher />, {locale: "zh"});
    const [zhBtn] = screen.getAllByRole("button");
    fireEvent.click(zhBtn);
    expect(replace).toHaveBeenCalledWith("/products/p0001", {locale: "zh"});
  });

  it("点击 en 按钮时切换到 en", () => {
    renderWithIntl(<LanguageSwitcher />, {locale: "zh"});
    const [, enBtn] = screen.getAllByRole("button");
    fireEvent.click(enBtn);
    expect(replace).toHaveBeenCalledWith("/products/p0001", {locale: "en"});
  });

  it("locale=en 时 en 按钮处于激活态", () => {
    renderWithIntl(<LanguageSwitcher />, {locale: "en"});
    const [zhBtn, enBtn] = screen.getAllByRole("button");
    expect(enBtn.className).toContain("bg-ink");
    expect(zhBtn.className).not.toContain("bg-ink");
  });

  it("locale=zh 时 zh 按钮处于激活态", () => {
    renderWithIntl(<LanguageSwitcher />, {locale: "zh"});
    const [zhBtn, enBtn] = screen.getAllByRole("button");
    expect(zhBtn.className).toContain("bg-ink");
    expect(enBtn.className).not.toContain("bg-ink");
  });
});
