/**
 * 站点全局配置 / Global site configuration.
 * 修改品牌信息只需改这里 / Edit brand info here in one place.
 */
export const siteConfig = {
  // 品牌/作者名 / Brand/author name.
  author: "Layicr",
  // 首页副标题（中英双语）/ Hero subtitle (bilingual).
  heroSub: {
    zh: "所想即架构，所做即成型，即刻即赋能。",
    en: "What you conceive becomes architecture, what you build takes form in an instant, what you deliver empowers immediately.",
  },
  // 首页标题（中英双语）/ Hero title (bilingual).
  heroTitle: {
    zh: "产品矩阵",
    en: "Product Matrix",
  },
  // 关于页副标题（中英双语）/ About page subtitle (bilingual).
  aboutSub: {
    zh: "一群热爱手写与涂鸦的产品人，笃信好的产品该如便签般随手可得、温暖随性，用技术驱动生活，贴近真实日常。",
    en: "A team of product people who love handwriting and doodles. We believe great products should be as accessible and warm as sticky notes. Driving life with technology, staying close to everyday reality.",
  },
  // 社交链接 / Social links.
  github: "https://github.com/layicr",
  twitter: "https://x.com/layicr",
  website: "https://www.lyc.la",
  // 代码仓库 / Source repository.
  repoUrl: "https://github.com/layicr/product-matrix",
  // 反馈问题入口 / Issue tracker.
  issuesUrl: "https://github.com/layicr/product-matrix/issues",
} as const;

export type SiteConfig = typeof siteConfig;
