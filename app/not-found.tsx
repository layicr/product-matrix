"use client";

import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {IntlFallbackProvider} from "@/lib/intl-fallback";
import {LocaleSync} from "@/lib/locale-sync";

// 根级 404 页面（脱离 [lang] provider，使用 IntlFallbackProvider 兜底）。
// Root 404 page (outside the [lang] provider, falls back via IntlFallbackProvider).
function NotFoundContent() {
  const t = useTranslations("notFound");
  const locale = useLocale();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
      <div className="text-center">
        <div className="font-display text-8xl md:text-9xl mb-4">{t("code")}</div>
        <h1 className="font-display text-2xl md:text-3xl mb-3">{t("title")}</h1>
        <p className="text-ink/60 mb-8 max-w-md">{t("desc")}</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center bg-ink text-white border-[3px] border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#1A1A1A] transition-all"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  );
}

export default function NotFound() {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <IntlFallbackProvider>
          <NotFoundContent />
        </IntlFallbackProvider>
        <LocaleSync />
      </body>
    </html>
  );
}
