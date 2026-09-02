"use client";

import {motion} from "framer-motion";
import {useLocale, useTranslations} from "next-intl";
import {siteConfig} from "@/lib/site-config";
import {isLocale} from "@/i18n/routing";

// 首页 Hero 区：标题、副标题与统计数据，带 Framer Motion 入场动画。
// Home Hero section: title, subtitle and stats, with Framer Motion entrance animation.
//
// productCount = 核心产品数（不含已归档/规划中），liveCount = 已上线数，二者均由调用方
// 从产品数据算出，避免写死导致状态变更后数字失真。
// productCount = core products (excl. archived/planned), liveCount = live products.
// Both are derived from the product data by the caller so they never go stale.
export default function Hero({
  productCount,
  liveCount,
}: {
  productCount: number;
  liveCount: number;
}) {
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "zh";
  const t = useTranslations();
  const heroSub = siteConfig.heroSub[locale];
  const heroTitle = siteConfig.heroTitle[locale];

  return (
    <section className="text-center px-6 md:px-10 py-8 md:py-12 relative overflow-hidden">
      {/* 涂鸦装饰 / Doodle decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-2 left-[8%] w-12 opacity-70" viewBox="0 0 50 50" fill="none" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round">
          <path d="M5 25 Q15 5 25 25 T45 25" />
        </svg>
        <svg className="absolute top-5 right-[10%] w-10 opacity-70" viewBox="0 0 40 40" fill="none" stroke="#EF5350" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="20" cy="20" r="15" />
          <path d="M12 20 L18 26 L28 14" />
        </svg>
        <svg className="absolute bottom-2 left-[15%] w-9 opacity-70" viewBox="0 0 35 35" fill="none" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round">
          <path d="M5 30 L17.5 5 L30 30" />
          <path d="M10 22 L25 22" />
        </svg>
      </div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
      >
        <h1 className="font-hand text-5xl md:text-7xl lg:text-8xl inline-block relative -rotate-1.5 leading-tight">
          {heroTitle}
          <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-4" viewBox="0 0 200 16" preserveAspectRatio="none">
            <path d="M2 10 Q50 2 100 8 T198 6" fill="none" stroke="#EF5350" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </h1>

        <p className="font-script text-base md:text-xl lg:text-2xl max-w-xl mx-auto mt-6 text-ink-light leading-relaxed rotate-0.5">
          {heroSub}
        </p>

        <div className="flex justify-center gap-6 md:gap-10 mt-8 flex-wrap">
          <div className="text-center -rotate-1">
            <div className="font-caveat text-4xl md:text-5xl font-bold leading-none relative inline-block">
              {productCount}
              <span className="absolute -bottom-0.5 -left-1 -right-1 h-2 bg-sticky-yellow -z-10 -rotate-1 rounded" />
            </div>
            <div className="font-script text-sm text-ink-light mt-1.5">{t("hero.stat1")}</div>
          </div>
          <div className="text-center rotate-1">
            <div className="font-caveat text-4xl md:text-5xl font-bold leading-none relative inline-block">
              {liveCount}
              <span className="absolute -bottom-0.5 -left-1 -right-1 h-2 bg-sticky-blue -z-10 rotate-1 rounded" />
            </div>
            <div className="font-script text-sm text-ink-light mt-1.5">{t("hero.stat2")}</div>
          </div>
          <div className="text-center -rotate-0.5">
            <div className="font-caveat text-4xl md:text-5xl font-bold leading-none relative inline-block">
              ∞
              <span className="absolute -bottom-0.5 -left-1 -right-1 h-2 bg-sticky-pink -z-10 -rotate-0.5 rounded" />
            </div>
            <div className="font-script text-sm text-ink-light mt-1.5">{t("hero.stat3")}</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
