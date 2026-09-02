// 单元测试：lib/queries/products 数据层（mock @libsql/client 验证行映射与查询）。
// Unit test: lib/queries/products data layer (mock @libsql/client, verify row mapping & queries).
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";

// Mock unstable_cache：测试环境缺少 incrementalCache，直接透传原始函数。
// Mock unstable_cache: test env lacks incrementalCache, pass through to original function.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, _key?: unknown, _opts?: unknown) => fn,
}));

import {setDb} from "@/lib/db";
import {
  getAllProducts,
  getActiveProductCount,
  getProductById,
} from "@/lib/queries/products";
import {getLocalizedProduct} from "@/lib/localize";

type MockRow = Record<string, unknown>;

function makeRow(overrides: Partial<MockRow> = {}): MockRow {
  return {
    id: "p0001",
    num: "01",
    name_zh: "智能风控引擎",
    name_en: "Risk Control Engine",
    category_zh: "风控",
    category_en: "Risk",
    color: "coffee",
    status: "live",
    launch: "2024-Q1",
    demo_url: "https://example.com/demo",
    desc_zh: "中文描述",
    desc_en: "English desc",
    features_zh: JSON.stringify(["特性一", "特性二"]),
    features_en: JSON.stringify(["Feature one", "Feature two"]),
    is_new: 1,
    is_watched: 1,
    ...overrides,
  };
}

const mockClient = {
  execute: vi.fn(),
};

describe("lib/products 数据层（mock @libsql/client）", () => {
  beforeEach(() => {
    setDb(mockClient as unknown as never);
  });

  afterEach(() => {
    mockClient.execute.mockReset();
    setDb(null);
  });

  it("getAllProducts 将行映射为嵌套 {zh,en} 的 Product 且按 num 升序", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [makeRow({num: "01", id: "p0001"}), makeRow({num: "02", id: "p0002"})],
      rowsAffected: 2,
    } as never);

    const products = await getAllProducts();
    expect(mockClient.execute).toHaveBeenCalledWith(
      "SELECT * FROM products ORDER BY num ASC",
    );
    expect(products).toHaveLength(2);
    // 验证嵌套结构（非平铺）
    expect(products[0].name).toEqual({zh: "智能风控引擎", en: "Risk Control Engine"});
    expect(products[0].category).toEqual({zh: "风控", en: "Risk"});
    expect(products[0].features).toEqual({
      zh: ["特性一", "特性二"],
      en: ["Feature one", "Feature two"],
    });
    // 保留标量字段
    expect(products[0].id).toBe("p0001");
    expect(products[0].color).toBe("coffee");
    expect(products[0].status).toBe("live");
    expect(products[0].demoUrl).toBe("https://example.com/demo");
    expect(products[0].isNew).toBe(true);
    expect(products[0].isWatched).toBe(true);
  });

  it("getProductById 使用参数化查询并返回单条/undefined", async () => {
    const single = makeRow();
    mockClient.execute.mockResolvedValue({rows: [single], rowsAffected: 1} as never);

    const found = await getProductById("p0001");
    expect(mockClient.execute).toHaveBeenCalledWith({
      sql: "SELECT * FROM products WHERE id = ?",
      args: ["p0001"],
    });
    expect(found?.id).toBe("p0001");
    expect(found?.desc.en).toBe("English desc");

    mockClient.execute.mockResolvedValue({rows: [], rowsAffected: 0} as never);
    const missing = await getProductById("nope");
    expect(missing).toBeUndefined();
  });

  it("features 的 JSON 解析失败时应降级为空数组（不拖垮整页）", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [makeRow({features_zh: "not-json", features_en: "not-json"})],
      rowsAffected: 1,
    } as never);
    // safeParseFeatures: 解析失败时降级为空数组，而非抛出异常
    const products = await getAllProducts();
    expect(products).toHaveLength(1);
    expect(products[0].features).toEqual({zh: [], en: []});
  });

  it("getActiveProductCount 用参数化 NOT IN 统计非归档/规划中的核心产品", async () => {
    mockClient.execute.mockResolvedValue({
      rows: [{count: 3}],
      rowsAffected: 1,
    } as never);

    const count = await getActiveProductCount();
    // 非活跃状态（archived/planned）通过占位符拼接参数化 NOT IN，不注入字符串。
    expect(mockClient.execute).toHaveBeenCalledWith({
      sql: "SELECT COUNT(*) AS count FROM products WHERE status NOT IN (?, ?)",
      args: ["archived", "planned"],
    });
    expect(count).toBe(3);
  });

  it("getActiveProductCount 结果为空时降级为 0", async () => {
    mockClient.execute.mockResolvedValue({rows: [], rowsAffected: 0} as never);
    const count = await getActiveProductCount();
    expect(count).toBe(0);
  });

  it("getLocalizedProduct 仍能正确本地化 DB 产品", async () => {
    mockClient.execute.mockResolvedValue({rows: [makeRow()], rowsAffected: 1} as never);
    const [product] = await getAllProducts();
    expect(getLocalizedProduct(product, "en").name).toBe("Risk Control Engine");
    expect(getLocalizedProduct(product, "zh").name).toBe("智能风控引擎");
  });
});
