"use client";

import {motion} from "framer-motion";
import {Flame} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {colorMap} from "@/lib/colors";
import {getLocalizedProduct} from "@/lib/localize";
import type {Product} from "@/lib/types";
import {statusConfig} from "@/lib/status";
import {isLocale} from "@/i18n/routing";

// 产品卡片：便签纸外观，按语言本地化字段，带入场/悬停动画。
// Product card: sticky-note look, localized per locale, with entrance & hover animations.
interface ProductCardProps {
  product: Product;
  index: number;
  onClick: () => void;
}

export default function ProductCard({product, index, onClick}: ProductCardProps) {
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "zh";
  const t = useTranslations();
  const localized = getLocalizedProduct(product, locale);
  const status = statusConfig[product.status];

  // 不同卡片的旋转角度 / Per-card rotation for a hand-pinned look.
  const rotations = ["-rotate-2", "rotate-1.5", "-rotate-1", "rotate-2", "-rotate-1.5", "rotate-1"];
  const rotation = rotations[index % rotations.length];

  return (
    <motion.article
      initial={{opacity: 0, y: -30, rotate: -5, scale: 0.9}}
      animate={{opacity: 1, y: 0, rotate: 0, scale: 1}}
      transition={{duration: 0.5, delay: index * 0.06, type: "spring", bounce: 0.4}}
      whileHover={{rotate: 0, scale: 1.04, y: -6, boxShadow: "0 12px 30px rgba(0,0,0,0.18)"}}
      whileTap={{scale: 0.97, rotate: 0}}
      className={`relative cursor-pointer ${rotation} hover:!rotate-0 hover:!scale-[1.04] hover:!-translate-y-1.5 transition-all duration-300 origin-top touch-manipulation select-none`}
      onClick={onClick}
    >
      <div className="tape" />
      <div className="pin" />

      <div className={`p-5 md:p-6 pt-7 min-h-[240px] md:min-h-[260px] flex flex-col relative shadow-sticky border-2 border-black/10 ${colorMap[product.color]}`}>
        {/* 角标：NEW / 关注（小火）/ Badges: NEW & watched (fire). */}
        {(product.isNew || product.isWatched) && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {product.isNew && (
              <span className="font-caveat font-bold text-[10px] md:text-xs tracking-widest px-2 py-0.5 rounded-full bg-red-500 text-white -rotate-3 shadow-sm">
                NEW
              </span>
            )}
            {product.isWatched && (
              <span className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-paper border-2 border-dashed border-orange-500 shadow-sm rotate-6">
                <Flame className="w-4 h-4 md:w-[18px] md:h-[18px] text-orange-500" />
              </span>
            )}
          </div>
        )}

        <h3 className="font-hand text-xl md:text-[26px] leading-tight mb-2.5 inline-block">
          {localized.name}
        </h3>

        <p className="font-script text-sm md:text-base leading-relaxed text-ink-light flex-1 mb-3">
          {localized.desc}
        </p>

        <div className="flex items-center justify-between pt-2.5 border-t-2 border-dashed border-black/15">
          <span className={`inline-flex items-center gap-1 font-caveat text-xs md:text-sm font-semibold px-2.5 py-1 border-2 border-ink rounded-full ${status.bg}`}>
            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-ink ${product.status === "live" ? "animate-pulse-dot" : ""}`} />
            {t(status.labelKey)}
          </span>

          <span className="circle-tag font-caveat text-sm md:text-base font-bold w-12 h-12 md:w-16 md:h-16">
            {product.launch}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
