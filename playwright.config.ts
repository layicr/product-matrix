// Playwright 配置：仅运行 UI / UE / 安全 三类端到端测试，webServer 自动启动 dev。
// Playwright config: runs only UI / UE / security E2E suites; webServer auto-starts dev.
import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  // 仅收集 UI / UE / 安全 三类 E2E（单元测试由 Vitest 负责）/ Collect only UI / UE / security E2E (unit tests are Vitest's job).
  testMatch: /.*\/(ui|ue|security)\/.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["json", {outputFile: "test/report/playwright-results.json"}],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
});
