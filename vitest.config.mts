// Vitest 配置：jsdom 环境运行单元测试，setupFiles 注入 polyfill，@ 别名指向项目根。
// Vitest config: jsdom env for unit tests, setupFiles inject polyfills, "@" alias → project root.
import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/unit/**/*.test.{ts,tsx}"], // 仅单元测试（安全测试用 Playwright）/ Unit tests only (security tests use Playwright).
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "test/report/coverage",
      include: ["lib/**", "components/**"],
    },
  },
});
