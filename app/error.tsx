"use client";

import {useEffect} from "react";
import {useLocale, useTranslations} from "next-intl";
import {IntlFallbackProvider} from "@/lib/intl-fallback";
import {handButtonBase} from "@/lib/styles";
import {LocaleSync} from "@/lib/locale-sync";

// 错误边界属性 / Error boundary props.
interface ErrorProps {
  error: Error & {digest?: string};
  reset: () => void;
}

function ErrorContent({error, reset}: ErrorProps) {
  const t = useTranslations("error");
  const locale = useLocale();

  useEffect(() => {
    // 记录错误到控制台（生产环境可接入 Sentry 等监控）
    // Log the error to the console (wire up Sentry etc. in production).
    console.error("应用错误:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 涂鸦风格的错误图标 / Doodle-style error icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-sticky-yellow border-[3px] border-ink rounded-lg -rotate-3 shadow-hand flex items-center justify-center">
            <span className="font-caveat text-6xl font-bold text-ink">!</span>
          </div>
          {/* 涂鸦装饰 / Doodle decoration */}
          <svg className="absolute -top-4 -right-4 w-10 h-10" viewBox="0 0 40 40">
            <path
              d="M5 20 Q10 5 20 10 T35 15"
              fill="none"
              stroke="#EF5350"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 错误标题 / Error title */}
        <h1 className="font-hand text-4xl text-ink mb-4 -rotate-1 inline-block">
          {t("title")}
        </h1>

        {/* 错误描述 / Error description */}
        <p className="font-script text-lg text-ink-light mb-2 leading-relaxed">
          {t("desc")}
        </p>

        {/* 错误信息（开发环境显示）/ Error details (shown in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-white/60 border-2 border-dashed border-ink/30 rounded-lg text-left">
            <p className="font-caveat text-sm text-ink-light/70 mb-1">
              {t("devDetail")}
            </p>
            <p className="font-script text-sm text-ink-light break-all">{error.message}</p>
            {error.digest && (
              <p className="font-caveat text-xs text-ink-light/50 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 / Action buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={reset}
            className={`${handButtonBase} font-hand text-lg bg-ink text-paper px-8 py-3 -rotate-1`}
          >
            {t("reload")}
          </button>
          <a
            href={`/${locale}`}
            className={`${handButtonBase} font-hand text-lg bg-sticky-blue px-8 py-3 rotate-1`}
          >
            {t("home")}
          </a>
        </div>

        {/* 底部装饰文字 / Footer decoration */}
        <p className="font-caveat text-sm text-ink-light/40 mt-10">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}

export default function Error({error, reset}: ErrorProps) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <IntlFallbackProvider>
          <ErrorContent error={error} reset={reset} />
        </IntlFallbackProvider>
        <LocaleSync />
      </body>
    </html>
  );
}
