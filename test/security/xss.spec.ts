// 安全测试：搜索框对 <script> / <img onerror> 注入的转义与不执行校验。
// Security test: search box escapes <script>/<img onerror> injection and never executes.
import {test, expect} from "@playwright/test";

test.describe("XSS 注入防护", () => {
  test.beforeEach(async ({page}) => {
    // 监控是否触发 alert（任何脚本执行都会失败本测试）
    await page.addInitScript(() => {
      (window as unknown as {__alertCalled: boolean}).__alertCalled = false;
      window.alert = (() => {
        (window as unknown as {__alertCalled: boolean}).__alertCalled = true;
      }) as unknown as typeof window.alert;
    });
  });

  test("搜索框注入 <script> 被转义且不执行", async ({page}) => {
    await page.goto("/zh");
    const payload = "<script>alert('xss')</script>";
    const input = page.getByPlaceholder("搜索产品、功能、分类...");
    await input.fill(payload);

    // 受控输入框应精确回显字面量，而非注入可执行节点
    await expect(input).toHaveValue(payload);
    await expect(page.locator("script", {hasText: "alert"})).toHaveCount(0);

    const alertCalled = await page.evaluate(
      () => (window as unknown as {__alertCalled: boolean}).__alertCalled,
    );
    expect(alertCalled).toBeFalsy();
  });

  test("搜索框注入 <img onerror> 不执行", async ({page}) => {
    await page.goto("/zh");
    const payload = "<img src=x onerror=alert(1)>";
    const input = page.getByPlaceholder("搜索产品、功能、分类...");
    await input.fill(payload);

    await expect(input).toHaveValue(payload);
    await expect(page.locator("img[onerror]")).toHaveCount(0);

    const alertCalled = await page.evaluate(
      () => (window as unknown as {__alertCalled: boolean}).__alertCalled,
    );
    expect(alertCalled).toBeFalsy();
  });
});
