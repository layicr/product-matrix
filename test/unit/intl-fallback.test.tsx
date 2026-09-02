// 组件测试：IntlFallbackProvider 为根级边界提供自包含 i18n（按 URL 推断语言）。
// Component test: IntlFallbackProvider supplies self-contained i18n for root boundaries (locale from URL).
import {describe, it, expect, vi, afterEach} from "vitest";
import {render, screen, cleanup} from "@testing-library/react";
import {IntlFallbackProvider} from "@/lib/intl-fallback";
import {useLocale, useTranslations} from "next-intl";

// 探针子组件：消费 provider 提供的 locale 与翻译，验证 i18n 上下文真实生效。
// Probe child: consume the locale and translations from the provider to verify the i18n context works.
function Probe() {
  const locale = useLocale();
  const t = useTranslations("notFound");
  return (
    <span data-testid="probe">
      {locale}:{t("back")}
    </span>
  );
}

const originalPath = window.location.pathname;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // 恢复 pathname（jsdom 下通过 History API 还原）。
  window.history.replaceState({}, "", originalPath);
});

describe("IntlFallbackProvider", () => {
  it("提供 i18n 上下文：子组件可读取 locale 与翻译", () => {
    render(
      <IntlFallbackProvider>
        <Probe />
      </IntlFallbackProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("zh:返回首页");
  });

  it("URL 为 /en 路径时推断为 en（使用英文翻译）", () => {
    // useEffect 中通过 window.location.pathname 推断语言。
    window.history.pushState({}, "", "/en/products/p0001");
    render(
      <IntlFallbackProvider>
        <Probe />
      </IntlFallbackProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("en:Back to Home");
  });

  it("URL 为 /zh 路径时保持 zh", () => {
    window.history.pushState({}, "", "/zh/about");
    render(
      <IntlFallbackProvider>
        <Probe />
      </IntlFallbackProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("zh:返回首页");
  });

  it("未知语言路径回退为 zh（默认语言）", () => {
    window.history.pushState({}, "", "/fr/x");
    render(
      <IntlFallbackProvider>
        <Probe />
      </IntlFallbackProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("zh:返回首页");
  });
});
