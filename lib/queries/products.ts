import {unstable_cache} from "next/cache";
import {getDb} from "../db";
import type {Product} from "@/lib/types";
import {NON_ACTIVE_STATUSES} from "@/lib/status";
import {localizedField} from "./row-mapper";

// 单行记录的原始形态（列名与数据库表一致）/ Raw row shape (column names match the DB table).
type ProductRow = Record<string, unknown>;

// 安全解析 features JSON：解析失败时降级为空数组，避免单条坏数据拖垮整页。
// Safely parse features JSON: degrade to empty array on failure instead of crashing the whole page.
function safeParseFeatures(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 将数据库行映射回 Product 对象（把 _zh/_en 列重新组合为 { zh, en } 结构）。
// Map a DB row back to a Product, re-grouping the _zh/_en columns into { zh, en }.
function rowToProduct(row: ProductRow): Product {
  return {
    id: String(row.id),
    num: String(row.num),
    name: localizedField(row, "name"),
    category: localizedField(row, "category"),
    color: row.color as Product["color"],
    status: row.status as Product["status"],
    isNew: Number(row.is_new) === 1,
    isWatched: Number(row.is_watched) === 1,
    isPopup: Number(row.is_popup) === 1,
    launch: String(row.launch),
    demoUrl: String(row.demo_url),
    desc: localizedField(row, "desc"),
    features: {
      zh: safeParseFeatures(row.features_zh),
      en: safeParseFeatures(row.features_en),
    },
  };
}

// 内部实现（无缓存）/ Internal implementation without caching.
async function fetchAllProducts(): Promise<Product[]> {
  const db = getDb();
  const result = await db.execute("SELECT * FROM products ORDER BY num ASC");
  return result.rows.map((row) => rowToProduct(row as ProductRow));
}

async function fetchActiveProductCount(): Promise<number> {
  const db = getDb();
  const placeholders = NON_ACTIVE_STATUSES.map(() => "?").join(", ");
  const result = await db.execute({
    sql: `SELECT COUNT(*) AS count FROM products WHERE status NOT IN (${placeholders})`,
    args: [...NON_ACTIVE_STATUSES],
  });
  return Number(result.rows[0]?.count ?? 0);
}

async function fetchProductById(id: string): Promise<Product | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return undefined;
  return rowToProduct(result.rows[0] as ProductRow);
}

/** 从 libSQL 读取全部产品（按编号升序，缓存 60s）/ Fetch all products ordered by number (cached 60s). */
export const getAllProducts = unstable_cache(fetchAllProducts, ["all-products"], {
  revalidate: 60,
});

/** 统计核心产品数量（缓存 60s）/ Count core products (cached 60s). */
export const getActiveProductCount = unstable_cache(
  fetchActiveProductCount,
  ["active-product-count"],
  {revalidate: 60},
);

/** 按 id 从 libSQL 读取单个产品（缓存 60s）/ Fetch a single product by id (cached 60s). */
export const getProductById = unstable_cache(
  fetchProductById,
  ["product-by-id"],
  {revalidate: 60},
);
