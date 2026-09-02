// 组件测试：Footer 渲染作者署名。
// Component test: Footer renders author attribution.
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {renderWithIntl} from "@/test/utils";
import Footer from "@/components/footer";
import {siteConfig} from "@/lib/site-config";

describe("Footer", () => {
  it("渲染页脚容器与作者署名", () => {
    renderWithIntl(<Footer />, {locale: "zh"});
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    // © 与作者名是相邻独立文本节点，整段文本为 "©Layicr"，用正则匹配作者名。
    expect(screen.getByText(new RegExp(siteConfig.author))).toBeInTheDocument();
  });

  it("含版权符号 ©", () => {
    const {container} = renderWithIntl(<Footer />, {locale: "en"});
    expect(container.textContent).toContain("©");
  });
});
