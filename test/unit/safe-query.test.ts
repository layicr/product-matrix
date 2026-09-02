// 单元测试：lib/safe-query 数据读取兜底（成功透传 / 失败降级默认值）。
// Unit test: lib/safe-query data-read fallback (pass-through on success / degrade on failure).
import {describe, it, expect, vi, afterEach} from "vitest";
import {safeQuery} from "@/lib/safe-query";

describe("safeQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("查询成功时返回原始结果", async () => {
    const fn = vi.fn().mockResolvedValue([1, 2, 3]);
    await expect(safeQuery("label", fn, [])).resolves.toEqual([1, 2, 3]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("查询失败时降级为 fallback 并记录错误日志", async () => {
    const err = new Error("db down");
    const fn = vi.fn().mockRejectedValue(err);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(safeQuery("getAllProducts", fn, [])).resolves.toEqual([]);
    // 日志包含查询标签，便于服务端排障。
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("getAllProducts"),
      expect.anything(),
    );
    spy.mockRestore();
  });

  it("fallback 可为任意类型的默认值（如数字计数）", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    const result = await safeQuery("count", fn, 0);
    expect(result).toBe(0);
  });

  it("异常被捕获后不向调用方抛出", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("unexpected"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(safeQuery("x", fn, null)).resolves.toBeNull();
  });
});
