import type {MetadataRoute} from "next";
import {getAllProducts} from "@/lib/queries/products";
import {routing} from "@/i18n/routing";
import {absoluteUrl} from "@/lib/site-url";
import {hreflangLanguages} from "@/lib/seo";
import {safeQuery} from "@/lib/safe-query";

// 构建期一次性计算 lastModified，避免每次请求都 new Date() 导致 sitemap 内容不稳定。
// Compute lastModified once at build time to keep sitemap output stable across requests.
const BUILD_TIME = new Date();

// 动态生成 sitemap.xml：覆盖每种语言下的首页、关于页与全部产品详情页。
// Dynamically generate sitemap.xml covering the home, about and every product page for each locale.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // DB 异常时降级为空产品列表，仍输出首页/关于页，而不是让 sitemap 整份 500。
  // Degrade to an empty product list on DB failure so the sitemap still emits
  // home/about entries instead of 500ing entirely.
  const products = await safeQuery("getAllProducts", getAllProducts, []);

  // 每个条目都带上完整的 hreflang 组（含自引用），
  // 让搜索引擎识别 /zh/* 与 /en/* 是同一内容的不同语言版本。
  // Every entry carries the full hreflang group (self-referential), so search
  // engines know /zh/* and /en/* are language variants of the same content.
  for (const lang of routing.locales) {
    entries.push({
      url: absoluteUrl(`/${lang}`),
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {languages: hreflangLanguages("")},
    });

    entries.push({
      url: absoluteUrl(`/${lang}/about`),
      lastModified: BUILD_TIME,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {languages: hreflangLanguages("/about")},
    });

    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/${lang}/products/${product.id}`),
        lastModified: BUILD_TIME,
        // 已上线产品更稳定（低频更新、权重更高）；未上线产品状态变动更频繁。
        // Live products are more stable (lower frequency, higher priority);
        // not-yet-live products change status more often.
        changeFrequency: product.status === "live" ? "monthly" : "weekly",
        priority: product.status === "live" ? 0.8 : 0.6,
        alternates: {languages: hreflangLanguages(`/products/${product.id}`)},
      });
    }
  }

  return entries;
}
