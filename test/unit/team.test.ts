// 单元测试：lib/queries/team 数据层（mock @libsql/client 验证行映射与查询）。
// Unit test: lib/queries/team data layer (mock @libsql/client, verify row mapping & query).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";

// Mock unstable_cache：测试环境缺少 incrementalCache，直接透传原始函数。
// Mock unstable_cache: test env lacks incrementalCache, pass through to original function.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, _key?: unknown, _opts?: unknown) => fn,
}));

import {setDb} from "@/lib/db";
import {getTeam} from "@/lib/queries/team";

const mockClient = {
  execute: vi.fn(),
};

describe("lib/team 数据层（mock @libsql/client）", () => {
  beforeEach(() => {
    setDb(mockClient as unknown as never);
  });

  afterEach(() => {
    mockClient.execute.mockReset();
    setDb(null);
  });

  it("getTeam 按 ord 升序查询并按 {zh,en} 重组行", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [
        {
          id: "t01",
          ord: 1,
          name_zh: "张明远",
          name_en: "Mingyuan Zhang",
          role_zh: "创始人 & CEO",
          role_en: "Founder & CEO",
          avatar_zh: "张",
          avatar_en: "Z",
          bg: "bg-sticky-yellow",
        },
        {
          id: "t02",
          ord: 2,
          name_zh: "李思琪",
          name_en: "Siqi Li",
          role_zh: "CTO · 技术负责人",
          role_en: "CTO · Tech Lead",
          avatar_zh: "李",
          avatar_en: "L",
          bg: "bg-sticky-blue",
        },
      ],
      rowsAffected: 2,
    } as never);

    const team = await getTeam();
    expect(mockClient.execute).toHaveBeenCalledWith(
      "SELECT * FROM team ORDER BY ord ASC",
    );
    expect(team).toHaveLength(2);
    expect(team[0]).toEqual({
      name: {zh: "张明远", en: "Mingyuan Zhang"},
      role: {zh: "创始人 & CEO", en: "Founder & CEO"},
      avatar: {zh: "张", en: "Z"},
      bg: "bg-sticky-yellow",
    });
    // 顺序保持 ord 升序（数组原样映射）
    expect(team[1].name.zh).toBe("李思琪");
  });

  it("空结果返回空数组", async () => {
    mockClient.execute.mockResolvedValue({rows: [], rowsAffected: 0} as never);
    const team = await getTeam();
    expect(team).toEqual([]);
  });
});
