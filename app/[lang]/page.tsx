import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import HomeClient from "@/components/home-client";
import {getAllProducts} from "@/lib/queries/products";
import {siteConfig} from "@/lib/site-config";
import {safeJsonLd} from "@/lib/json-ld";
import {absoluteUrl} from "@/lib/site-url";
import {safeQuery} from "@/lib/safe-query";
import {isLocale} from "@/i18n/routing";
import {localeAlternates} from "@/lib/seo";

// 首页 metadata（标题 / 描述 / canonical，按语言生成）。
// Home page metadata (title / description / canonical, per locale).
export async function generateMetadata({
  params,
}: {
  params: Promise<{lang: string}>;
}): Promise<Metadata> {
  const {lang} = await params;
  const locale = isLocale(lang) ? lang : "zh";
  const t = await getTranslations({locale, namespace: "nav"});
  return {
    title: `${t("logo")} — ${siteConfig.heroTitle[locale]}`,
    description: siteConfig.heroSub[locale],
    // canonical + hreflang：声明 /zh 与 /en 互为语言版本。
    // canonical + hreflang: declare /zh and /en as language variants.
    alternates: localeAlternates(locale, ""),
  };
}

export default async function Home({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;
  const locale = isLocale(lang) ? lang : "zh";

  // 服务端从 libSQL 读取全部产品；DB 异常时降级为空列表而不是整页 500。
  // Fetch all products from libSQL; degrade to an empty list instead of 500ing the page.
  const products = await safeQuery("getAllProducts", getAllProducts, []);

  // 首页结构化数据：CollectionPage + ItemList（每个产品一个 Product 条目）。
  // Home structured data: CollectionPage + ItemList (one Product entry per product).
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`,
    description: `${siteConfig.heroSub.zh} ${siteConfig.heroSub.en}`,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale === "en" ? "en" : "zh-CN",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name[locale],
          description: product.desc[locale],
          url: absoluteUrl(`/${locale}/products/${product.id}`),
          category: product.category[locale],
          offers: {
            "@type": "Offer",
            availability:
              product.status === "live"
                ? "https://schema.org/InStock"
                : product.status === "soon"
                  ? "https://schema.org/PreOrder"
                  : "https://schema.org/OutOfStock",
          },
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: safeJsonLd(itemListJsonLd)}}
      />
      <HomeClient products={products} />
    </>
  );
}
