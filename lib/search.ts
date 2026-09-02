import type {Product} from "@/lib/types";
import {getLocalizedProduct, type Language} from "@/lib/localize";

/**
 * 判断产品是否匹配搜索查询（中英文名称 / 描述 / 分类 / 特性）。
 * Check whether a product matches a search query across localized fields.
 *
 * 抽为纯函数便于单测，且避免在组件内重复 8 次 toLowerCase().includes() 内联逻辑。
 * Extracted as a pure function for unit testing and to avoid repeating 8 inline
 * toLowerCase().includes() checks inside the component.
 */
export function productMatchesQuery(
  product: Product,
  query: string,
  locale: Language,
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const localized = getLocalizedProduct(product, locale);

  return (
    localized.name.toLowerCase().includes(q) ||
    product.name.zh.toLowerCase().includes(q) ||
    product.name.en.toLowerCase().includes(q) ||
    localized.desc.toLowerCase().includes(q) ||
    localized.category.toLowerCase().includes(q) ||
    product.features.zh.some((f) => f.toLowerCase().includes(q)) ||
    product.features.en.some((f) => f.toLowerCase().includes(q))
  );
}
