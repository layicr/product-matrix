// 安全测试：验证首页/详情页的安全响应头（X-Frame-Options 等）。
// Security test: verify security response headers (X-Frame-Options, etc.) on home & detail.
import {test, expect} from "@playwright/test";

test.describe("安全响应头", () => {
  test("中文首页携带基础安全响应头", async ({page}) => {
    const response = await page.goto("/zh");
    const headers = response!.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toContain("strict-origin");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
  });

  test("英文首页同样包含安全响应头", async ({page}) => {
    const response = await page.goto("/en");
    const headers = response!.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("产品详情页包含安全响应头", async ({page}) => {
    const response = await page.goto("/zh/products/1");
    const headers = response!.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("响应头禁止被嵌入 iframe（X-Frame-Options=DENY）", async ({page}) => {
    const response = await page.goto("/zh");
    expect(response!.headers()["x-frame-options"]).toBe("DENY");
  });
});
