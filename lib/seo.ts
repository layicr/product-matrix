// SEO 工具：hreflang 交替语言映射与 alternates 生成。
// SEO helpers: hreflang alternate-language map and alternates builder.
//
// 中英双语站点必须声明 hreflang，否则搜索引擎无法识别两个语言版本的关系，
// 会把 /zh/x 与 /en/x 当作重复内容处理。
// A bilingual site must declare hreflang, otherwise search engines cannot tell
// that /zh/x and /en/x are language variants and treat them as duplicate content.
import {routing} from "@/i18n/routing";
import {absoluteUrl} from "@/lib/site-url";

/**
 * 生成 hreflang 交替语言映射（含 x-default）。
 * Build the hreflang alternate-language map (including x-default).
 *
 * @param path 不含语言前缀的路径，如 "" / "/about" / "/products/p0001"。
 *             Locale-less path, e.g. "" / "/about" / "/products/p0001".
 *
 * hreflang 条目必须是绝对 URL 且自引用（每个语言版本都要列出自己），
 * 否则搜索引擎会忽略整组声明。
 * hreflang entries must be absolute and self-referential (each variant lists
 * itself), otherwise search engines ignore the whole annotation group.
 */
export function hreflangLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(`/${locale}${path}`);
  }

  // x-default 指向默认语言，供语言未匹配的用户回退。
  // x-default points at the default locale for users whose language is unmatched.
  languages["x-default"] = absoluteUrl(`/${routing.defaultLocale}${path}`);

  return languages;
}

/**
 * 生成 Next.js Metadata 的 alternates（canonical + hreflang）。
 * Build Next.js Metadata alternates (canonical + hreflang).
 *
 * canonical 与 hreflang 统一使用绝对 URL，确保与 sitemap、JSON-LD 完全一致，
 * 且不依赖 metadataBase（未配置 NEXT_PUBLIC_SITE_URL 时会缺失）。
 * Both canonical and hreflang use absolute URLs so they stay consistent with
 * sitemap and JSON-LD, and do not depend on metadataBase (which is undefined
 * when NEXT_PUBLIC_SITE_URL is unset).
 */
export function localeAlternates(locale: string, path: string) {
  return {
    canonical: absoluteUrl(`/${locale}${path}`),
    languages: hreflangLanguages(path),
  };
}
