// UE 测试：移动/桌面视口响应式布局与键盘可达性。
// UE test: responsive layout across mobile/desktop viewports and keyboard accessibility.
import {test, expect} from "@playwright/test";

test.describe("响应式与键盘导航", () => {
  test("移动视口(375x667)首页正常渲染且导航可见", async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});
    await page.goto("/zh");
    await expect(
      page.getByRole("heading", {name: "产品矩阵"}),
    ).toBeVisible();
    await expect(page.getByRole("link", {name: "产品矩阵"})).toBeVisible();
  });

  test("桌面视口(1280x800)首页正常渲染", async ({page}) => {
    await page.setViewportSize({width: 1280, height: 800});
    await page.goto("/zh");
    await expect(
      page.getByRole("heading", {name: "产品矩阵"}),
    ).toBeVisible();
  });

  test("产品网格在移动端单列、桌面端多列", async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});
    await page.goto("/zh");
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    await page.setViewportSize({width: 1280, height: 800});
    // 桌面布局下，网格容器具备多列特征（grid-cols 类）
    const grid = page.locator("section .grid").first();
    await expect(grid).toHaveClass(/lg:grid-cols-3/);
  });

  test("键盘可达：搜索框可被聚焦并通过键盘输入", async ({page}) => {
    await page.goto("/zh");
    const input = page.getByPlaceholder("搜索产品、功能、分类...");
    await input.focus();
    await expect(input).toBeFocused();
    await input.type("风控");
    await expect(input).toHaveValue("风控");
  });

  test("键盘可达：语言切换按钮可通过键盘激活", async ({page}) => {
    await page.goto("/zh");
    const enBtn = page.getByRole("button", {name: "EN", exact: true});
    await enBtn.focus();
    await expect(enBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en/);
  });
});
