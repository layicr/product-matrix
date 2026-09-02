// UE 测试：全部路由的 axe-core 结构性可访问性审计（排除 color-contrast）。
// UE test: axe-core structural a11y audit across all routes (color-contrast excluded).
import {test, expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// 注：主动排除 color-contrast 规则——本项目为便签涂鸦风格设计，
// 部分装饰性浅色系为有意设计，结构性可访问性（语义/角色/标签/命名）才是审计重点。
// Note: color-contrast is intentionally excluded — the doodle style uses deliberate light tints;
// structural a11y (semantics / roles / labels / naming) is the focus of this audit.
const routes = ["/zh", "/en", "/zh/about", "/zh/products/3"];

for (const route of routes) {
  test(`可访问性审计: ${route}`, async ({page}) => {
    await page.goto(route);
    const results = await new AxeBuilder({page})
      .disableRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
