// 站点基础 URL（构建期由 NEXT_PUBLIC_SITE_URL 注入）。
// Base site URL (injected at build time from NEXT_PUBLIC_SITE_URL).
//
// 未配置时回退到 localhost，而不是产出 "undefined/zh" 这类脏 URL ——
// sitemap / robots / OG / JSON-LD 都依赖它，脏值会静默破坏 SEO 且不报错。
// When unset we fall back to localhost instead of emitting "undefined/zh" —
// sitemap / robots / OG / JSON-LD all depend on it, and dirty values silently
// break SEO without any build error.
const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** 规范化后的站点 URL（去掉结尾斜杠）/ Normalized site URL (trailing slash removed). */
export const SITE_URL = raw.replace(/\/+$/, "");

/** 是否显式配置了站点 URL / Whether the site URL was explicitly configured. */
export const HAS_SITE_URL = SITE_URL.length > 0;

/** 未配置时的兜底源，保证产物始终是合法 URL / Fallback origin so output is always a valid URL. */
const FALLBACK_ORIGIN = "http://localhost:3000";

/** 拼接绝对 URL（path 可带或不带前导斜杠）/ Build an absolute URL (leading slash optional). */
export function absoluteUrl(path: string): string {
  const origin = HAS_SITE_URL ? SITE_URL : FALLBACK_ORIGIN;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${suffix}`;
}
