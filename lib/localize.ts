import type {Product} from "@/lib/types";
import type {Locale} from "@/i18n/routing";

// 支持的语言（与 i18n/routing 的 locales 保持单一真源）。
// Supported languages (single source of truth from i18n/routing).
export type Language = Locale;

// 本地化后的产品类型：双语言字段被展开为单一语言的字符串。
// Localized product: the bilingual fields are flattened into single-language strings.
export type LocalizedProduct = Omit<
  Product,
  "name" | "category" | "desc" | "features"
> & {
  name: string;
  category: string;
  desc: string;
  features: string[];
};

/**
 * 纯函数：将双语言 Product 本地化为指定语言的对象。
 * Pure function: localize a bilingual Product into the given language.
 *
 * 不访问数据库，可在客户端安全使用。
 * Does not touch the database, so it is safe to call on the client.
 */
export function getLocalizedProduct(
  product: Product,
  lang: Language,
): LocalizedProduct {
  return {
    ...product,
    name: product.name[lang],
    category: product.category[lang],
    desc: product.desc[lang],
    features: product.features[lang],
  };
}
