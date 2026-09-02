"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {Lightbulb, ArrowUp} from "lucide-react";
import {siteConfig} from "@/lib/site-config";
import {cn} from "@/lib/utils";

/**
 * 右下角浮动操作按钮：反馈问题 + 返回顶部。
 * Floating action buttons: feedback and back-to-top.
 */
export default function FloatingActions() {
  const t = useTranslations("floating");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 200);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, {passive: true});
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const openFeedback = () => {
    window.open(siteConfig.issuesUrl, "_blank", "noopener,noreferrer");
  };

  const baseStyles =
    "h-12 w-12 md:h-14 md:w-14 rounded-full border-2 border-ink text-white flex items-center justify-center shadow-hand-btn transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink";

  return (
    <div
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 md:bottom-[max(2rem,env(safe-area-inset-bottom))] md:right-8 z-50 flex flex-col gap-3"
      aria-label={t("label")}
    >
      <button
        type="button"
        onClick={openFeedback}
        className={cn(baseStyles, "bg-sticky-coral hover:rotate-3")}
        aria-label={t("feedback")}
        title={t("feedback")}
      >
        <Lightbulb className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          baseStyles,
          "bg-sticky-royalBlue hover:-rotate-3",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label={t("backToTop")}
        title={t("backToTop")}
      >
        <ArrowUp className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
