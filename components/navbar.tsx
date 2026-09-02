"use client";

import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import LanguageSwitcher from "@/components/language-switcher";

// 顶部导航：Logo（返回首页）+ 语言切换 + 关于入口。
// Top navigation: logo (home) + language switcher + about link.
export default function Navbar() {
  const t = useTranslations();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-6 md:px-10 py-4 pt-[max(1rem,env(safe-area-inset-top))] relative z-50">
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="flex items-center gap-2.5 -rotate-1 hover:rotate-0 transition-transform">
          <span className="animate-wiggle inline-block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span className="font-hand text-xl md:text-2xl">{t("nav.logo")}</span>
        </Link>
        <LanguageSwitcher />
      </div>

      <Link
        href="/about"
        className="ml-auto font-hand text-base md:text-lg bg-ink text-paper border-[2.5px] border-ink px-4 md:px-5 py-1.5 md:py-2 rotate-1 hover:-rotate-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shadow-hand-btn whitespace-nowrap"
      >
        {t("nav.cta")} ✎
      </Link>
    </nav>
  );
}
