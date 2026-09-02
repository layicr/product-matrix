import {defineRouting} from 'next-intl/routing';

// 语言路由配置：声明支持的语言与默认语言。
// Locale routing config: the supported locales and the default locale.
export const routing = defineRouting({
  // 支持的语言列表 / Supported locales.
  locales: ['zh', 'en'],
  // 默认语言 / Default locale.
  defaultLocale: 'zh',
});

// 从 routing.locales 推导出的语言类型，避免各处写 "zh" | "en" 联合类型。
// Locale type derived from routing.locales to avoid scattering "zh" | "en" unions.
export type Locale = (typeof routing.locales)[number];

// 类型守卫：校验字符串是否为合法 locale，替代 `as Locale` 断言。
// Type guard: validate a string as a Locale, replacing `as Locale` assertions.
export function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}
