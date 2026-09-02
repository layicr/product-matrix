// UI E2E：详情页按语言渲染、核心特性列表、非法 id 返回 404。
// UI E2E: detail page renders per locale, shows features, invalid id returns 404.
import {test, expect} from "@playwright/test";

test.describe("产品详情 UI", () => {
  test("详情页按中文渲染", async ({page}) => {
    await page.goto("/zh/products/3");
    await expect(page.getByRole("heading", {level: 1})).toContainText(
      "客户画像引擎",
    );
  });

  test("详情页按英文渲染", async ({page}) => {
    await page.goto("/en/products/3");
    await expect(page.getByRole("heading", {level: 1})).toContainText(
      "Customer Profiling Engine",
    );
  });

  test("详情页展示核心特性列表", async ({page}) => {
    await page.goto("/zh/products/3");
    await expect(page.getByText("1000+ 预置标签，支持自定义标签加工")).toBeVisible();
  });

  test("非法产品 id 返回 404 页面", async ({page}) => {
    const response = await page.goto("/zh/products/nope");
    expect(response!.status()).toBe(404);
    await expect(page.getByText("页面未找到")).toBeVisible();
  });
});
