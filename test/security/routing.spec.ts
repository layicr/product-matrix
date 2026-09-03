// 安全测试：非法 lang 回退、越权 id 404、开放重定向防护。
// Security test: invalid lang fallback, unauthorized id 404, open-redirect protection.
import {test, expect} from "@playwright/test";
import {blockPopup} from "../utils/block-popup";

test.beforeEach(({page}) => blockPopup(page));

test.describe("路由安全与越权兜底", () => {
  test("非法 lang 被重写为站内 locale 前缀（无开放重定向）", async ({page}) => {
    await page.goto("/xx");
    const url = new URL(page.url());
    // 应停留在站内（localhost），并被重写为带 locale 前缀的路径
    expect(url.hostname).toBe("localhost");
    expect(url.pathname).toMatch(/^\/(zh|en)\//);
    expect(page.url()).not.toContain("evil.com");
  });

  test("不存在的产品 id 返回 404", async ({page}) => {
    const response = await page.goto("/zh/products/does-not-exist");
    expect(response!.status()).toBe(404);
  });

  test("语言切换不会产生跨域/开放重定向", async ({page}) => {
    await page.goto("/zh");
    await page.getByRole("button", {name: "EN", exact: true}).click();
    await expect(page).toHaveURL(/\/en/);
    const url = new URL(page.url());
    expect(url.hostname).toBe("localhost");
  });

  test("带 query 的非法跳转参数不会导致离站重定向", async ({page}) => {
    await page.goto("/zh?next=https://evil.example.com");
    const url = new URL(page.url());
    // query 参数仅作为字符串保留，pathname 仍为本站 /zh，未发生离站跳转
    expect(url.hostname).toBe("localhost");
    expect(url.pathname).toBe("/zh");
  });
});
