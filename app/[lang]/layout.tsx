import type {Metadata, Viewport} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing, isLocale} from "@/i18n/routing";
import "../globals.css";
import SiteAnalytics from "@/components/analytics";
import SwipeGestures from "@/components/swipe-gestures";
import {siteConfig} from "@/lib/site-config";
import {safeJsonLd} from "@/lib/json-ld";
import {absoluteUrl, SITE_URL, HAS_SITE_URL} from "@/lib/site-url";
import {localeAlternates} from "@/lib/seo";

// 视口配置（主题色、移动端宽度等）/ Viewport config (theme color, mobile width, etc.).
export const viewport: Viewport = {
  themeColor: "#FDF6E3",
  width: "device-width",
  initialScale: 1,
  // 允许页面内容延伸到屏幕边缘（刘海屏 / 圆角屏），配合 env(safe-area-inset-*) 使用。
  // Allow content to extend to screen edges (notched / rounded displays), used with env(safe-area-inset-*).
  viewportFit: "cover",
};

// 预生成每种语言的静态参数 / Pre-generate static params for every locale.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({lang: locale}));
}

// 按语言生成 metadata（title / description / canonical / OG / Twitter）。
// Generate per-locale metadata (title / description / canonical / OG / Twitter).
export async function generateMetadata({
  params,
}: {
  params: Promise<{lang: string}>;
}): Promise<Metadata> {
  const {lang} = await params;
  // 统一用 isLocale 守卫收窄类型，避免使用 `as "zh" | "en"` 断言。
  // Narrow the type with the isLocale guard instead of `as "zh" | "en"` assertions.
  const locale = isLocale(lang) ? lang : "zh";
  const t = await getTranslations({locale, namespace: "nav"});

  const ogLocale = locale === "en" ? "en_US" : "zh_CN";
  const altLocale = locale === "en" ? "zh_CN" : "en_US";

  return {
    metadataBase: HAS_SITE_URL ? new URL(SITE_URL) : undefined,
    title: {
      default: `${t("logo")} — ${siteConfig.heroTitle[locale]}`,
      template: `%s | ${t("logo")}`,
    },
    description: siteConfig.heroSub[locale],
    // canonical 必须带语言前缀：此前写死 "/" 导致 /zh/about、/en/about
    // 互相声明为同一 canonical，被判定重复内容；同时补上 hreflang 声明语言版本。
    // canonical must carry the locale prefix: hardcoding "/" made /zh/about and
    // /en/about claim the same canonical; hreflang declares the language variants.
    alternates: localeAlternates(locale, ""),
    openGraph: {
      type: "website",
      // OG 需要 en_US / zh_CN 格式，而不是 zh / en。
      // OG expects en_US / zh_CN rather than zh / en.
      locale: ogLocale,
      alternateLocale: [altLocale],
      url: absoluteUrl(`/${locale}`),
      siteName: `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`,
      title: `${t("logo")} — ${siteConfig.heroTitle[locale]}`,
      description: siteConfig.heroSub[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("logo")} — ${siteConfig.heroTitle[locale]}`,
      description: siteConfig.heroSub[locale],
    },
    robots: {index: true, follow: true},
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;

  // 非法语言直接 404 / Invalid locale → 404.
  if (!isLocale(lang)) {
    notFound();
  }

  const messages = await getMessages();
  const htmlLang = lang === "en" ? "en" : "zh-CN";

  // 全站 WebSite 结构化数据 / Site-wide WebSite structured data.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.heroTitle.en,
    alternateName: siteConfig.heroTitle.zh,
    url: absoluteUrl(`/${lang}`),
  };

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body
        className="font-sans text-ink antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: safeJsonLd(jsonLd)}}
        />
        <NextIntlClientProvider locale={lang} messages={messages}>
          {children}
        </NextIntlClientProvider>
        {/* 全站触屏手势：快速上下滑动直达顶部 / 底部（桌面端不受影响）。
            Site-wide touch gesture: fast vertical flick jumps to top / bottom (desktop untouched). */}
        <SwipeGestures />
        <SiteAnalytics />
      </body>
    </html>
  );
}
