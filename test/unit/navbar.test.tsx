// 组件测试：Navbar 渲染 Logo、语言切换与关于入口。
// Component test: Navbar renders logo, language switcher and about link.
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import Navbar from "@/components/navbar";

// 直接 mock next-intl 的导航 API，避免其底层依赖 next/navigation 在 vitest 隔离注册表中解析失败。
// Mock next-intl's navigation API directly to avoid its internal next/navigation dependency failing to resolve.
vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({
    Link: ({href, children, className, ...rest}: {href: string; children: React.ReactNode; className?: string}) =>
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a href={href} className={className} {...rest}>{children}</a>,
    redirect: () => undefined,
    usePathname: () => "/",
    useRouter: () => ({push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn()}),
    getPathname: () => "/",
  }),
}));

describe("Navbar", () => {
  it("渲染导航栏与语言切换按钮", () => {
    renderWithIntl(<Navbar />, {locale: "zh"});
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    // LanguageSwitcher 渲染两个语言按钮（zh / en）
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("Logo 链接指向首页", () => {
    renderWithIntl(<Navbar />, {locale: "zh"});
    const links = screen.getAllByRole("link");
    const home = links.find((el) => (el.getAttribute("href") ?? "").match(/\/$|\/zh$|\/en$/));
    expect(home).toBeTruthy();
  });

  it("包含指向 /about 的入口链接", () => {
    renderWithIntl(<Navbar />, {locale: "zh"});
    const about = screen
      .getAllByRole("link")
      .find((el) => (el.getAttribute("href") ?? "").includes("about"));
    expect(about).toBeTruthy();
  });
});
