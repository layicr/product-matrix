// 单元测试：lib/queries/partners 数据层（mock @libsql/client 验证行映射与查询）。
// Unit test: lib/queries/partners data layer (mock @libsql/client, verify row mapping & query).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";

// Mock unstable_cache：测试环境缺少 incrementalCache，直接透传原始函数。
// Mock unstable_cache: test env lacks incrementalCache, pass through to original function.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, _key?: unknown, _opts?: unknown) => fn,
}));

import {setDb} from "@/lib/db";
import {getPartners} from "@/lib/queries/partners";

const mockClient = {
  execute: vi.fn(),
};

describe("lib/partners 数据层（mock @libsql/client）", () => {
  beforeEach(() => {
    setDb(mockClient as unknown as never);
  });

  afterEach(() => {
    mockClient.execute.mockReset();
    setDb(null);
  });

  it("getPartners 按 ord 升序查询并重组 {zh,en}，空 logo/url 映射为 null", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [
        {
          id: "p01",
          ord: 1,
          name_zh: "示例科技",
          name_en: "Example Tech",
          logo: null,
          url: null,
        },
        {
          id: "p02",
          ord: 2,
          name_zh: "星辰金融",
          name_en: "Stellar Finance",
          logo: "https://example.com/logo.png",
          url: "https://example.com",
        },
      ],
      rowsAffected: 2,
    } as never);

    const partners = await getPartners();
    expect(mockClient.execute).toHaveBeenCalledWith(
      "SELECT * FROM partners ORDER BY ord ASC",
    );
    expect(partners).toHaveLength(2);
    // logo/url 为空 → nullableField 返回 null
    expect(partners[0]).toEqual({
      name: {zh: "示例科技", en: "Example Tech"},
      logo: null,
      url: null,
    });
    // 非空 logo/url 保留字符串
    expect(partners[1].logo).toBe("https://example.com/logo.png");
    expect(partners[1].url).toBe("https://example.com");
  });

  it("空结果返回空数组", async () => {
    mockClient.execute.mockResolvedValue({rows: [], rowsAffected: 0} as never);
    const partners = await getPartners();
    expect(partners).toEqual([]);
  });
});
