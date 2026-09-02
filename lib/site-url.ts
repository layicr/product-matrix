// 站点基础 URL（构建期由 NEXT_PUBLIC_SITE_URL 注入）。
// Base site URL (injected at build time from NEXT_PUBLIC_SITE_URL).
//
// 解析顺序（优先级从高到低）：
//   1. NEXT_PUBLIC_SITE_URL —— 显式配置（Vercel 控制台必填项）
//   2. VERCEL_URL            —— Vercel 自动注入的部署域名（your-project.vercel.app）
//   3. http://localhost:3000 —— 仅本地开发且前两者均未设置时的兜底
// Resolution order (highest → lowest priority):
//   1. NEXT_PUBLIC_SITE_URL —— explicit config (required env var on Vercel)
//   2. VERCEL_URL            —— Vercel-injected deployment domain (your-project.vercel.app)
//   3. http://localhost:3000 — only a local-dev fallback when neither is set
//
// 始终产出合法 URL，避免 "undefined/zh" 这类脏值 ——
// sitemap / robots / OG / JSON-LD 都依赖它，脏值会静默破坏 SEO 且不报错。
// Always yields a valid URL instead of dirty values like "undefined/zh" —
// sitemap / robots / OG / JSON-LD all depend on it, and dirty values silently
// break SEO without any build error.
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";

/** 规范化后的站点 URL（去掉结尾斜杠）/ Normalized site URL (trailing slash removed). */
export const SITE_URL = raw.replace(/\/+$/, "");

/** 是否显式配置了站点 URL / Whether the site URL was explicitly configured. */
export const HAS_SITE_URL = SITE_URL.length > 0;

/** 拼接绝对 URL（path 可带或不带前导斜杠）/ Build an absolute URL (leading slash optional). */
export function absoluteUrl(path: string): string {
  const origin = SITE_URL;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${suffix}`;
}
