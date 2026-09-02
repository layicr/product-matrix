// UI E2E：导航到关于页、关于页返回首页，跨语言导航正常。
// UI E2E: navigate to About, back to home, cross-locale navigation works.
import {test, expect} from "@playwright/test";

test.describe("页面导航 UI", () => {
  test("点击导航『申请试用』跳转到关于页", async ({page}) => {
    await page.goto("/zh");
    await page.getByRole("link", {name: /申请试用/}).click();
    await expect(page).toHaveURL(/\/zh\/about/);
    await expect(
      page.getByRole("heading", {name: "关于我们"}),
    ).toBeVisible();
  });

  test("关于页返回首页", async ({page}) => {
    await page.goto("/zh/about");
    // 导航 logo 链回首页
    await page.getByRole("link", {name: "产品矩阵"}).click();
    await expect(page).toHaveURL(/\/zh$/);
  });

  test("英文环境下关于页跳转正常", async ({page}) => {
    await page.goto("/en");
    await page.getByRole("link", {name: /Get Started/}).click();
    await expect(page).toHaveURL(/\/en\/about/);
  });
});
