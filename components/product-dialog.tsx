"use client";

import {useRef, useState, type RefObject} from "react";
import {motion} from "framer-motion";
import {useLocale, useTranslations} from "next-intl";
import {isLocale} from "@/i18n/routing";
import {colorMap} from "@/lib/colors";
import {getLocalizedProduct, type Language} from "@/lib/localize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import type {Product} from "@/lib/types";
import {statusConfig} from "@/lib/status";
import {handButtonBase} from "@/lib/styles";

// 产品详情弹窗：展示描述与特性，支持移动端下滑关闭 + 左右滑动切换产品。
// Product detail dialog: shows description & features, with swipe-down-to-close and swipe-left/right to switch products.
interface ProductDialogProps {
  product: Product;
  onClose: () => void;
  /** 左右滑动切换产品：1 = 下一个，-1 = 上一个 / Swipe to switch: 1 = next, -1 = previous. */
  onNavigate?: (dir: 1 | -1) => void;
}

export default function ProductDialog({product, onClose, onNavigate}: ProductDialogProps) {
  const rawLocale = useLocale();
  const locale: Language = isLocale(rawLocale) ? rawLocale : "zh";
  const t = useTranslations();
  const localized = getLocalizedProduct(product, locale);
  const status = statusConfig[product.status];
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const startAtTop = useRef(true);
  const axis = useRef<"none" | "x" | "y">("none");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  // 记录触摸起点与是否位于顶部；阻止冒泡，避免同时触发首页“左右滑动切分类”。
  // Record the start point and whether scrolled to top; stop propagation so the home page's
  // swipe-to-change-filter handler (an ancestor in the React tree) doesn't also fire.
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    axis.current = "none";
    const el = scrollRef.current as HTMLDivElement | null;
    startAtTop.current = !el || el.scrollTop <= 0;
  };

  // 首次移动时锁定主轴：横向跟手平移；纵向仅在顶部且向下拖动时跟手，避免与内容滚动冲突。
  // Lock the dominant axis on first move — horizontal follows the finger; vertical only when at top
  // and dragging downward, so it won't fight native scrolling.
  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (axis.current === "none" && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      setDragging(true);
    }

    if (axis.current === "x") {
      setDragX(dx * 0.4);
    } else if (axis.current === "y" && startAtTop.current && dy > 0) {
      setDragOffset(dy * 0.5);
    }
  };

  // 纵向超阈值关闭弹窗，横向超阈值切换产品，否则回弹。
  // Vertical past threshold closes; horizontal past threshold switches product; otherwise snap back.
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (dragOffset > 100) {
      onClose();
    } else if (Math.abs(dragX) > 70) {
      onNavigate?.(dragX < 0 ? 1 : -1);
    }
    setDragOffset(0);
    setDragX(0);
    setDragging(false);
    axis.current = "none";
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={scrollRef as RefObject<HTMLDivElement>}
        style={{
          transform: `translate(calc(-50% + ${dragX}px), calc(-50% + ${dragOffset}px)) rotate(-0.5deg)`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`p-0 max-w-xl max-h-[88vh] overflow-y-auto animate-paper-in ${colorMap[product.color]} border-[2.5px] border-ink shadow-[6px_6px_0_rgba(0,0,0,0.15),0_20px_50px_rgba(0,0,0,0.2)] touch-pan-y`}
      >
        {/* 下滑关闭指示条 / Swipe-down-to-close handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-ink/30 rounded-full" />
        </div>
        {/* 顶部胶带 / Top tape */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rotate-2 w-28 h-8 bg-white/55 z-10" />

        <DialogHeader className="p-5 md:p-8 pb-4 md:pb-5 text-center space-y-2">
          <DialogTitle className="font-hand text-2xl md:text-4xl text-ink">
            {localized.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 md:px-8 pb-5 md:pb-6">
          <p className="font-script text-base md:text-lg leading-relaxed text-ink-light text-center mb-5 md:mb-6">
            {localized.desc}
          </p>

          <div className="font-hand text-lg md:text-2xl text-center mb-3 md:mb-4 block">
            {t("modal.features")}
          </div>

          <ul className="mb-6">
            {localized.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{opacity: 0, x: -10}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: i * 0.06}}
                className="py-2.5 flex items-start gap-3 font-script text-base md:text-lg leading-snug border-b border-dashed border-black/15 last:border-b-0"
              >
                <span className="font-caveat text-xl font-bold text-green-700 flex-shrink-0 -rotate-6">
                  ✓
                </span>
                {feature}
              </motion.li>
            ))}
          </ul>

          <div className="flex justify-center gap-6 p-4 border-2 border-dashed border-ink text-center">
            <div>
              <div className="font-caveat text-sm font-semibold text-ink-light mb-1">
                {t("modal.launch")}
              </div>
              <div className="font-hand text-lg">{product.launch}</div>
            </div>
            <div className="w-px bg-ink/20" />
            <div>
              <div className="font-caveat text-sm font-semibold text-ink-light mb-1">
                {t("modal.status")}
              </div>
              <div className="font-hand text-lg">{t(status.labelKey)}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 md:px-8 pb-5 md:pb-7 pt-1 flex-col sm:flex-row justify-center gap-3">
          <Button
            asChild
            className={`${handButtonBase} font-hand text-base bg-ink text-paper -rotate-1`}
          >
            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
              {t("modal.demo")}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
