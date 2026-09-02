import * as rootParams from 'next/root-params';
import {getRequestConfig} from 'next-intl/server';
import {routing, isLocale} from './i18n/routing';
import {notFound} from 'next/navigation';

// next-intl 请求级配置（Next.js 16 root-params 方案）：
// 直接从 URL 的 [lang] 根段读取 locale，避免使用已弃用的 requestLocale 参数。
// next-intl request config (Next.js 16 root-params): read the locale from the
// [lang] root segment instead of the deprecated `requestLocale` param.
export default getRequestConfig(async () => {
  const lang = await rootParams.lang();

  // 非法或缺失时使用 404 / 404 for missing or invalid locales.
  if (!lang || !isLocale(lang)) {
    notFound();
  }

  return {
    locale: lang,
    // 按语言动态导入翻译文件 / Dynamically import the translation file for the locale.
    messages: (await import(`./messages/${lang}.json`)).default,
  };
});
