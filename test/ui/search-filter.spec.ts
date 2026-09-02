// UI E2E：搜索过滤与清空恢复、筛选『全部』数量统计。
// UI E2E: search filter, clear-to-restore, "all" filter count.
import {test, expect} from "@playwright/test";

test.describe("搜索与筛选 UI", () => {
  test("搜索『客户画像』仅显示匹配产品", async ({page}) => {
    await page.goto("/zh");
    await page
      .getByPlaceholder("搜索产品、功能、分类...")
      .fill("客户画像");
    await expect(page.getByText("客户画像引擎")).toBeVisible();
    await expect(page.getByText("便签配色·yellow")).toHaveCount(0);
  });

  test("搜索清空后恢复全部产品", async ({page}) => {
    await page.goto("/zh");
    const input = page.getByPlaceholder("搜索产品、功能、分类...");
    await input.fill("客户画像");
    await expect(page.getByText("便签配色·yellow")).toHaveCount(0);
    await input.fill("");
    await expect(page.getByText("客户画像引擎")).toBeVisible();
    await expect(page.getByText("便签配色·yellow")).toBeVisible();
  });

  test("筛选『全部』显示全部产品数量", async ({page}) => {
    await page.goto("/zh");
    await page.getByRole("button", {name: "全部"}).click();
    await expect(page.getByText("共 30 张便签")).toBeVisible();
  });
});
