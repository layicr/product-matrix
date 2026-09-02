"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

/**
 * 根据 URL 路径同步 <html lang> 属性，避免 SSR 硬编码 zh-CN 与客户端语言不一致。
 * Syncs <html lang> from the URL path so SSR output matches the client locale.
 *
 * 用于脱离 [lang] provider 的根级边界（error / not-found），这些页面在 SSR 阶段
 * 硬编码了 lang="zh-CN"，hydration 后需同步为正确语言。
 * Used by root boundaries (error / not-found) that sit outside the [lang] provider
 * and hardcode lang="zh-CN" during SSR.
 *
 * 通过 usePathname 推断语言而非 useLocale，避免预渲染时缺少请求上下文导致抛错。
 * Infers locale from pathname instead of useLocale to avoid prerender errors.
 */
export function LocaleSync() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<"zh" | "en">("zh");

  useEffect(() => {
    const seg = pathname.split("/")[1];
    setLocale(seg === "en" ? "en" : "zh");
    document.documentElement.lang = seg === "en" ? "en" : "zh-CN";
  }, [pathname]);

  return null;
}
