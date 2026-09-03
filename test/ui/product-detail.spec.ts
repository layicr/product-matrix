// UI E2E：详情页按语言渲染、核心特性列表、非法 id 返回 404。
// UI E2E: detail page renders per locale, shows features, invalid id returns 404.
import {test, expect} from "@playwright/test";

test.describe("产品详情 UI", () => {
  test("详情页按中文渲染", async ({page}) => {
    await page.goto("/zh/products/p003");
    await expect(page.getByRole("heading", {level: 1})).toContainText(
      "演唱会足迹",
    );
  });

  test("详情页按英文渲染", async ({page}) => {
    await page.goto("/en/products/p003");
    await expect(page.getByRole("heading", {level: 1})).toContainText(
      "Concert Trail",
    );
  });

  test("详情页展示核心特性列表", async ({page}) => {
    await page.goto("/zh/products/p003");
    await expect(page.getByText("🧩 Nuxt")).toBeVisible();
  });

  test("非法产品 id 返回 404 页面", async ({page}) => {
    const response = await page.goto("/zh/products/nope");
    expect(response!.status()).toBe(404);
    await expect(page.getByText("页面未找到")).toBeVisible();
  });
});
