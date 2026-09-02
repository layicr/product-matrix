// 产品详情页（服务端从 libSQL 取数，按语言渲染 + JSON-LD + 动态 metadata）。
// Product detail page (server-side data from libSQL, rendered per locale with JSON-LD & dynamic metadata).
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft, Calendar} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {getProductById, getAllProducts} from "@/lib/queries/products";
import {getLocalizedProduct} from "@/lib/localize";
import {colorMap} from "@/lib/colors";
import {statusConfig} from "@/lib/status";
import {handButtonBase} from "@/lib/styles";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {safeJsonLd} from "@/lib/json-ld";
import {absoluteUrl} from "@/lib/site-url";
import {safeQuery} from "@/lib/safe-query";
import {isLocale, type Locale} from "@/i18n/routing";
import {localeAlternates} from "@/lib/seo";
import {siteConfig} from "@/lib/site-config";

// 路由集封闭：不在 generateStaticParams 中的 id 直接返回真实 404（Next 16 下
// dynamicParams 默认 true 会把 notFound() 按需渲染成 200 软 404，故显式关闭）。
// Closed route set: unknown ids get a real 404; dynamicParams defaults to true
// which turns notFound() into a 200 soft-404 under Next 16, so disable it.
export const dynamicParams = false;

// 静态生成：构建期预渲染所有产品详情页，配合 revalidate 做增量更新。
// Static generation: pre-render all product detail pages at build time with ISR.
export async function generateStaticParams() {
  const products = await safeQuery("getAllProducts", getAllProducts, []);
  return products.map((product) => ({id: product.id}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{lang: string; id: string}>;
}): Promise<Metadata> {
  const {lang, id} = await params;
  // DB 异常时视为未找到：返回 noindex 而不是让整页 500。
  // Treat a DB failure as not-found: return noindex instead of 500ing the page.
  const product = await safeQuery(
    "getProductById",
    () => getProductById(id),
    undefined,
  );

  if (!product) {
    return {
      title: "Not Found",
      robots: {index: false, follow: false},
    };
  }

  const locale: Locale = isLocale(lang) ? lang : "zh";
  const localized = getLocalizedProduct(product, locale);
  const productUrl = absoluteUrl(`/${locale}/products/${product.id}`);

  return {
    title: `${localized.name} — ${localized.category}`,
    description: localized.desc,
    alternates: localeAlternates(locale, `/products/${product.id}`),
    openGraph: {
      type: "article",
      title: `${localized.name} — ${localized.category}`,
      description: localized.desc,
      url: productUrl,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{lang: string; id: string}>;
}) {
  const {lang, id} = await params;
  const locale: Locale = isLocale(lang) ? lang : "zh";

  // DB 异常时降级为 404，而不是整页 500 / Degrade to 404 on DB failure instead of a 500.
  const product = await safeQuery(
    "getProductById",
    () => getProductById(id),
    undefined,
  );
  if (!product) notFound();

  const localized = getLocalizedProduct(product, locale);
  const t = await getTranslations({locale: lang});
  const td = await getTranslations({locale: lang, namespace: "detail"});

  // 用收窄后的 locale 而非原始 lang，保证与 canonical / hreflang 完全一致。
  // Use the narrowed locale (not raw lang) so it matches canonical / hreflang exactly.
  const productUrl = absoluteUrl(`/${locale}/products/${product.id}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized.name,
    description: localized.desc,
    url: productUrl,
    // image 是 Google Product 富媒体结果的推荐字段；此前缺失导致结构化数据基本无效。
    // image is recommended for Google Product results; without it the markup barely counts.
    image: absoluteUrl(`/${locale}/products/${product.id}/opengraph-image`),
    category: localized.category,
    sku: `PROD-${product.num}`,
    inLanguage: locale === "en" ? "en" : "zh-CN",
    brand: {
      "@type": "Brand",
      name: `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`,
    },
    // offers：金融科技产品无公开定价，故只声明供应状态与预约入口，不虚构价格。
    // offers: fintech products have no public price, so we declare availability
    // and the booking URL only rather than inventing a price.
    offers: {
      "@type": "Offer",
      availability:
        product.status === "live"
          ? "https://schema.org/InStock"
          : product.status === "soon"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
      url: product.demoUrl,
    },
  };

  // 面包屑结构化数据：首页 → 分类 → 当前产品，让搜索结果显示层级路径。
  // Breadcrumb structured data: home → category → current product, so search
  // results can show the hierarchical path.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.heroTitle[locale],
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        // 分类没有独立页面，因此只声明名称、不提供 item URL。
        // The category has no standalone page, so we declare its name only.
        name: localized.category,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: localized.name,
        item: productUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen notebook-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: safeJsonLd(productJsonLd)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: safeJsonLd(breadcrumbJsonLd)}}
      />

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* 返回按钮 / Back button */}
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 font-hand text-lg bg-transparent border-[2.5px] border-ink px-5 py-2 -rotate-1 hover:rotate-0 hover:bg-sticky-yellow transition-all mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {td("back")}
        </Link>

        <article>
          {/* 产品标题卡片（用产品便签颜色作为背景）/ Product title card (sticky-note color background) */}
          <div
            className={`${colorMap[product.color]} border-[2.5px] border-ink p-8 md:p-10 mb-8 relative overflow-hidden shadow-sticky -rotate-0.5`}
          >
            {/* 胶带 / Tape decoration */}
            <div className="tape" />
            {/* 大号编号水印 / Large number watermark */}
            <span className="absolute top-2 right-6 font-caveat text-8xl md:text-9xl font-bold opacity-15 select-none">
              {product.num}
            </span>

            <div className="font-caveat text-base font-semibold text-ink-light mb-3 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-ink-light inline-block" />
              {localized.category}
            </div>

            <h1 className="font-hand text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 relative inline-block">
              {localized.name}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q50 2 100 6 T198 5"
                  fill="none"
                  stroke="#EF5350"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </h1>

            <div className="flex items-center gap-4 flex-wrap mt-6">
              <span className="inline-flex items-center gap-2 font-caveat text-base font-semibold px-4 py-1.5 border-2 border-ink rounded-full bg-white/50">
                {t(statusConfig[product.status].labelKey)}
              </span>
              <span className="flex items-center gap-2 font-hand text-base">
                <Calendar className="w-4 h-4" />
                {product.launch}
              </span>
            </div>
          </div>

          {/* 产品描述和特性 / Description & features */}
          <div className="bg-white/60 border-[2.5px] border-ink p-8 md:p-10 shadow-sticky rotate-0.3">
            <p className="font-script text-lg md:text-xl leading-relaxed mb-10 text-ink-light">
              {localized.desc}
            </p>

            <h2 className="font-hand text-2xl md:text-3xl mb-6 -rotate-0.5 inline-block relative">
              {td("features")}
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 Q50 2 100 5 T198 4"
                  fill="none"
                  stroke="#EF5350"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </h2>

            <ul className="space-y-4 mb-10">
              {localized.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-script text-base md:text-lg leading-snug py-2 border-b border-dashed border-black/10 last:border-b-0"
                >
                  <span className="font-caveat text-xl font-bold text-green-700 flex-shrink-0 -rotate-6">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* 信息栏 / Info panel */}
            <div className="grid grid-cols-2 gap-4 p-6 border-2 border-dashed border-ink bg-white/50">
              <div>
                <div className="font-caveat text-sm font-semibold text-ink-light mb-1.5">
                  {td("launch")}
                </div>
                <div className="font-hand text-xl">{product.launch}</div>
              </div>
              <div>
                <div className="font-caveat text-sm font-semibold text-ink-light mb-1.5">
                  {td("status")}
                </div>
                <div className="font-hand text-xl">{t(statusConfig[product.status].labelKey)}</div>
              </div>
            </div>

            {/* 预约演示按钮 / Book a demo button */}
            <div className="mt-8 text-center">
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${handButtonBase} inline-flex items-center gap-2 font-hand text-lg bg-ink text-paper px-8 py-3 -rotate-1`}
              >
                {td("demo")}
              </a>
            </div>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  );
}
