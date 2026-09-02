"use client";

import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "@/i18n/navigation";

// 语言切换器：通过 next-intl 的导航 API 在保留当前路径的前提下切换 [lang]。
// Language switcher: switch [lang] while preserving the current path via next-intl navigation.
export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: "zh" | "en") => {
    router.replace(pathname, {locale: next});
  };

  return (
    <div className="flex items-center border-2 border-ink bg-white/50 overflow-hidden rotate-0.5">
      <button
        onClick={() => switchTo("zh")}
        className={`font-caveat text-base font-bold px-3 py-1 transition-colors ${
          locale === "zh"
            ? "bg-ink text-paper"
            : "text-ink-light hover:bg-sticky-yellow hover:text-ink"
        }`}
      >
        {t("zh")}
      </button>
      <div className="w-px h-[18px] bg-ink" />
      <button
        onClick={() => switchTo("en")}
        className={`font-caveat text-base font-bold px-3 py-1 transition-colors ${
          locale === "en"
            ? "bg-ink text-paper"
            : "text-ink-light hover:bg-sticky-yellow hover:text-ink"
        }`}
      >
        {t("en")}
      </button>
    </div>
  );
}
