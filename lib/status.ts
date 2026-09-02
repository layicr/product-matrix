import type {ProductStatus} from "@/lib/types";

/**
 * 产品状态 → 文案 key 与便签配色 / Product status → translation key & sticky color.
 *
 * labelKey 对应 messages 中的 status.{live,soon,planned,archived}
 * labelKey maps to status.{live,soon,planned,archived} in messages.
 */
export const statusConfig: Record<
  ProductStatus,
  {labelKey: string; bg: string}
> = {
  live: {labelKey: "status.live", bg: "bg-sticky-green"},
  soon: {labelKey: "status.soon", bg: "bg-sticky-yellow"},
  planned: {labelKey: "status.planned", bg: "bg-white/50"},
  archived: {labelKey: "status.archived", bg: "bg-sticky-slate"},
};

/**
 * 不计入「核心产品」的状态 / Statuses excluded from the "core product" count.
 *
 * 这是「核心产品」定义的唯一真源：
 * - lib/queries/products.ts 的 SQL 统计用它拼参数化 NOT IN
 * - components/home-client.tsx 的客户端统计用 isActiveProduct 判定
 * 两边曾各自写死导致数字不一致，故统一收敛到此处。
 * Single source of truth for the "core product" definition:
 * - lib/queries/products.ts builds its parameterized NOT IN from this
 * - components/home-client.tsx counts via isActiveProduct
 * These were previously duplicated and drifted apart, so they now share this list.
 */
export const NON_ACTIVE_STATUSES: readonly ProductStatus[] = [
  "archived",
  "planned",
];

/** 是否计入「核心产品」（不含已归档与规划中）/ Whether a product counts as a "core product". */
export function isActiveProduct(product: {
  status: ProductStatus;
}): boolean {
  return !NON_ACTIVE_STATUSES.includes(product.status);
}

/** 是否已上线 / Whether a product is live. */
export function isLiveProduct(product: {status: ProductStatus}): boolean {
  return product.status === "live";
}
