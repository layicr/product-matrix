// UI E2E：中/英文首页加载、语言切换改 URL、点击卡片打开详情弹窗。
// UI E2E: zh/en home load, language switch changes URL, card click opens detail dialog.
import {test, expect} from "@playwright/test";
import {blockPopup} from "../utils/block-popup";

test.beforeEach(({page}) => blockPopup(page));

test.describe("首页 UI", () => {
  test("中文首页加载并显示产品矩阵标题", async ({page}) => {
    await page.goto("/zh");
    await expect(
      page.getByRole("heading", {level: 1, name: "产品矩阵"}),
    ).toBeVisible();
  });

  test("英文首页加载并显示英文标题", async ({page}) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", {level: 1, name: "Product Matrix"}),
    ).toBeVisible();
  });

  test("语言切换按钮将 URL 改变为 /en", async ({page}) => {
    await page.goto("/zh");
    await page.getByRole("button", {name: "EN", exact: true}).click();
    await expect(page).toHaveURL(/\/en/);
    await expect(
      page.getByRole("heading", {level: 1, name: "Product Matrix"}),
    ).toBeVisible();
  });

  test("点击产品卡片打开详情弹窗", async ({page}) => {
    await page.goto("/zh");
    await page.locator("article", {hasText: "演唱会足迹"}).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("演唱会足迹")).toBeVisible();
  });
});
