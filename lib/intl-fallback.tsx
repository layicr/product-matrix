"use client";

import {useEffect, useState} from "react";
import {NextIntlClientProvider} from "next-intl";
import type {ReactNode} from "react";
import zh from "../messages/zh.json";
import en from "../messages/en.json";

// 中英文消息包 / Chinese & English message bundles.
const messagesMap = {zh, en} as const;

/**
 * 为脱离 [lang] provider 的根级边界（error / not-found）提供自包含的 i18n 上下文。
 * Self-contained i18n context for root boundaries (error / not-found) that sit
 * outside the [lang] NextIntlClientProvider.
 *
 * 客户端通过 URL 路径推断语言；SSR 阶段先输出 zh，hydration 后同步为正确语言。
 * On the client, locale is inferred from the URL path; SSR outputs "zh" first,
 * then hydrates to the correct locale.
 */
export function IntlFallbackProvider({children}: {children: ReactNode}) {
  const [locale, setLocale] = useState<"zh" | "en">("zh");

  useEffect(() => {
    const seg = window.location.pathname.split("/")[1];
    setLocale(seg === "en" ? "en" : "zh");
  }, []);

  const messages = messagesMap[locale] ?? zh;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
