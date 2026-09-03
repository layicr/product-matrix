# 产品矩阵 Product Matrix

[English](./README.en.md) | 简体中文

手写涂鸦风格（便签墙）的金融科技产品矩阵展示站，基于 **Next.js 16 (App Router)**，支持基于 URL 的中英文双语（next-intl）、由 **libSQL / Turso** 驱动的产品数据，以及一套完整的测试体系（单元 / UI / 可访问性 / 安全）。

## 技术栈

- **框架**：Next.js 16.3.3 (App Router, React 19, TypeScript)
- **样式**：Tailwind CSS 3
- **组件库**：shadcn/ui（底层为 Radix UI）
- **动画**：Framer Motion
- **图标**：Lucide React
- **国际化**：[`next-intl`](https://next-intl.dev) v4 —— 基于 URL 的 `[lang]` 动态路由、服务端渲染翻译、类型安全翻译键
- **数据库**：`@libsql/client` —— 支持 Turso 云（`libsql://`）与本地文件数据库（`file:`）
- **测试**：Vitest（单元）、@playwright/test（UI / 可访问性 / 安全）、@axe-core/playwright（可访问性审计）、@vitest/coverage-v8
- **部署**：Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 准备环境变量（本地默认回退到 ./data/local.db，可跳过）
cp .env.example .env.local

# 初始化 / 写入产品与团队数据到本地 libSQL
npm run seed

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

打开 http://localhost:3000 —— 会自动重定向到默认语言 `http://localhost:3000/zh`。

常用脚本（`package.json`）：

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` / `npm start` | 构建 / 启动生产版本 |
| `npm run lint` | ESLint |
| `npm run seed` | 执行 `scripts/seed.ts`，建表并从 `data/*.sql` 写入数据 |
| `npm test` / `npm run test:unit` | Vitest 运行单元测试 |
| `npm run test:watch` | Vitest 监听模式 |
| `npm run coverage` | 带覆盖率报告的单元测试 |
| `npm run test:e2e` | Playwright 运行 UI / UE / 安全 E2E |

## 项目结构

```
product-matrix/
├── app/
│   ├── [lang]/                       # 所有页面置于语言段之下
│   │   ├── layout.tsx                # 语言布局：root-params + NextIntlClientProvider + generateMetadata
│   │   ├── page.tsx                  # 首页（Server Component，await 取数 → HomeClient，附 JSON-LD）
│   │   ├── not-found.tsx             # 语言内 404
│   │   ├── opengraph-image.tsx       # 站点默认 OG 图（1200x630，按语言动态生成）
│   │   ├── about/page.tsx            # 关于我们（团队 / 联系方式）
│   │   └── products/[id]/
│   │       ├── page.tsx              # 产品详情页（动态 metadata + Product / Breadcrumb JSON-LD）
│   │       └── opengraph-image.tsx   # 产品专属 OG 图（按产品与语言动态生成）
│   ├── layout.tsx                    # 根布局（字体 + 全局样式）
│   ├── error.tsx                     # 错误边界（IntlFallbackProvider + LocaleSync 兜底）
│   ├── not-found.tsx                 # 根 404（IntlFallbackProvider + LocaleSync 兜底）
│   ├── globals.css                   # 全局样式（自托管字体 + 手写涂鸦风格）
│   ├── manifest.ts                   # PWA manifest
│   ├── sitemap.ts                    # 动态 sitemap.xml（含 zh/en 交替链接）
│   └── robots.ts                     # 动态 robots.txt
├── components/
│   ├── ui/                           # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   ├── analytics.tsx                 # 站点统计（百度统计 + GA4，未配置时返回 null）
│   ├── home-client.tsx               # 首页交互（Client Component，接收 products 为 props）
│   ├── navbar.tsx                    # 顶部导航
│   ├── hero.tsx                      # Hero 区
│   ├── search-bar.tsx                # 搜索框
│   ├── filter-bar.tsx                # 筛选栏（状态 + 原生插值）
│   ├── product-card.tsx              # 产品卡片
│   ├── product-grid.tsx              # 产品网格（按 category 分组）
│   ├── product-dialog.tsx            # 产品详情弹窗（支持下滑关闭）
│   ├── popup-intro.tsx               # 首页弹框动画（礼物盒飞入 → 爆炸 → 便签消息卡片）
│   ├── language-switcher.tsx         # 语言切换（URL 导航 / 交替链接）
│   ├── footer.tsx                    # 页脚
│   ├── floating-actions.tsx          # 右下角浮动按钮（反馈 + 返回顶部）
│   └── swipe-gestures.tsx            # 全站触屏手势（快速滑动直达顶部/底部）
├── i18n/
│   ├── routing.ts                    # locales: ['zh','en']，defaultLocale: 'zh'，isLocale 类型守卫
│   └── navigation.ts                 # 注入 routing 的 Link/useRouter/usePathname
├── i18n.ts                           # next-intl getRequestConfig（Next.js 16 root-params 方案）
├── middleware.ts                     # next-intl 语言检测与重定向（URL [lang] → cookie → Accept-Language → 默认 zh）
├── lib/
│   ├── db.ts                         # libSQL 单例客户端（env 感知，回退 file:./data/local.db）
│   ├── queries/                      # 数据访问层（异步 + unstable_cache 60s）
│   │   ├── products.ts               # getAllProducts / getActiveProductCount / getProductById
│   │   ├── team.ts                   # getTeam
│   │   ├── partners.ts               # getPartners
│   │   └── row-mapper.ts             # DB 行映射工具（_zh/_en 列 → {zh, en} 结构）
│   ├── localize.ts                   # 纯函数 getLocalizedProduct(product, lang)
│   ├── types/                        # 领域模型
│   │   ├── product.ts                # Product / ProductStatus / ProductColor
│   │   ├── team.ts                   # TeamMember
│   │   └── partner.ts                # Partner
│   ├── colors.ts                     # 便签配色映射（colorMap）
│   ├── status.ts                     # 产品状态配置 + 核心产品定义单一真源
│   ├── filters.ts                    # 筛选键单一真源（FILTER_KEYS / FilterKey）
│   ├── search.ts                     # 搜索匹配纯函数 productMatchesQuery
│   ├── about-stats.ts                # About 页统计项构建
│   ├── site-config.ts                # 站点全局配置（品牌名、社交链接等）
│   ├── site-url.ts                   # 站点基础 URL 工具（absoluteUrl）
│   ├── seo.ts                        # hreflang 与 alternates 生成（双语 SEO 单一真源）
│   ├── og-font.ts                    # OG 图字体加载（satori 仅支持 TTF/OTF/WOFF）
│   ├── safe-query.ts                 # 数据读取兜底（DB 异常时降级为安全默认值）
│   ├── json-ld.ts                    # JSON-LD 安全序列化（XSS 防护）
│   ├── styles.ts                     # 涂鸦风格样式常量
│   ├── utils.ts                      # cn() 工具函数（clsx + tailwind-merge）
│   ├── intl-fallback.tsx             # 兜底 Intl Provider（error/not-found 使用）
│   ├── locale-sync.tsx               # 根据 URL 同步 <html lang>（error/not-found 使用）
│   └── hooks/
│       └── use-swipe.ts              # 触屏滑动手势 hook
├── data/
│   ├── schema.sql                    # products / team / partners 建表语句（单一真源）
│   ├── products-data.sql             # 产品种子数据（INSERT）
│   ├── team-data.sql                 # 团队种子数据（INSERT）
│   └── partners-data.sql             # 合作伙伴种子数据（INSERT）
├── assets/
│   └── fonts/                        # 仅 OG 图构建期使用的 TTF（satori 不支持 woff2）
│       └── zcool-kuaile-v22-chinese-simplified-regular.ttf
├── messages/
│   ├── zh.json                       # 中文翻译
│   └── en.json                       # 英文翻译
├── public/
│   ├── fonts/                        # 自托管字体（latin + 中文子集，unicode-range 按需加载）
│   │   ├── zcool-kuaile-v22-latin-regular.woff2
│   │   ├── zcool-kuaile-v22-chinese-simplified-regular.woff2
│   │   ├── patrick-hand-v25-latin-regular.woff2
│   │   ├── caveat-v23-latin-regular.woff2
│   │   ├── noto-sans-sc-v40-latin-regular.woff2
│   │   └── noto-sans-sc-v40-chinese-simplified-regular.woff2
│   └── icon.svg                      # 站点图标
├── scripts/
│   └── seed.ts                       # 建表 + 写入 products / team / partners（冲突则 UPSERT）
├── test/
│   ├── unit/                         # Vitest 单元测试
│   ├── ui/                           # Playwright UI E2E
│   ├── ue/                           # Playwright 可访问性 / 响应式 / 键盘导航
│   ├── security/                     # Playwright 安全测试（响应头 / XSS / 路由越权）
│   ├── report/                       # 报告聚合（generate-report.ts）
│   ├── setup.ts                      # 测试 polyfill + renderWithIntl 辅助
│   └── utils.tsx                     # 测试通用工具
├── .env.example                      # 环境变量示例
├── next.config.js                    # createNextIntlPlugin + 安全响应头
├── vitest.config.mts                 # Vitest 配置（jsdom + setup）
├── playwright.config.ts              # Playwright 配置（baseURL + webServer）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── components.json
```

## 国际化（next-intl）

采用 next-intl 官方推荐的 `[lang]` 动态段方案，语言状态由 URL 携带，服务端可感知。

- **`i18n/routing.ts`**：声明 `locales: ['zh', 'en']` 与 `defaultLocale: 'zh'`，导出 `isLocale()` 类型守卫。
- **`i18n.ts`**：`getRequestConfig` 使用 Next.js 16 的 `root-params` 方案，从 URL 的 `[lang]` 根段读取 locale，非法/缺失时 `notFound()`。
- **`middleware.ts`**：next-intl 官方推荐的 `[lang]` 路由语言检测与重定向，优先级为 `URL [lang]` → `NEXT_LOCALE` cookie → `Accept-Language` → 默认 `zh`。因本仓库采用 `[lang]` 动态段路由，middleware 为必需组件（无 `proxy` 替代方案）。
- **`i18n/navigation.ts`**：提供注入了 `routing` 的 `Link` / `useRouter` / `usePathname`。
- **组件层**：Server Component 用 `getTranslations` 生成 metadata；Client Component 用 `useTranslations` / `useLocale`。
- **语言切换**：`language-switcher.tsx` 通过 `usePathname` / `useRouter` 切换到 `/{locale}/{rest}`（保留当前路径）。
- **`messages/zh.json` / `en.json`**：翻译键的唯一来源，构建期由 `createNextIntlPlugin` 校验。

## 数据层（libSQL / Turso）

产品、团队与合作伙伴数据运行时从 libSQL 读取，可动态更新。

- **`lib/db.ts`**：用 `@libsql/client` 的 `createClient` 维护**模块级单例**；连接串取自 `process.env.TURSO_DATABASE_URL`，缺失则回退 `file:./data/local.db`；`authToken` 取自 `TURSO_AUTH_TOKEN`。在 Vercel 等只读文件系统上，若使用 `file:` 库会先复制到可写的 `/tmp/local.db` 再以只读方式打开（仅读场景）。
- **`lib/queries/products.ts`**：
  - `getAllProducts(): Promise<Product[]>` —— 按 `num` 升序。
  - `getActiveProductCount(): Promise<number>` —— 核心产品计数（排除 archived / planned）。
  - `getProductById(id): Promise<Product | undefined>`。
  - 均使用 `unstable_cache` 缓存 60 秒。
- **`lib/queries/team.ts`**：`getTeam()` —— 按 `ord` 升序读取团队。
- **`lib/queries/partners.ts`**：`getPartners()` —— 读取合作伙伴。
- **`lib/queries/row-mapper.ts`**：`localizedField(row, prefix)` 将 `_zh/_en` 列重新组合为 `{zh, en}` 结构。
- **`lib/localize.ts`**：`getLocalizedProduct(product, lang)` —— **纯函数**（不访问 DB），把 `{zh, en}` 结构按当前语言展开为扁平字段。
- **`lib/safe-query.ts`**：`safeQuery<T>(label, fn, fallback)` —— DB 异常时降级为安全默认值，不 500 整页。

`Product` 类型定义于 `lib/types/product.ts`：

```typescript
type ProductStatus = "live" | "soon" | "planned" | "archived";

interface Product {
  id: string;                          // 产品唯一标识，如 p0001
  num: string;                         // 展示编号，如 "01"
  name: { zh: string; en: string };    // 产品名称（中/英）
  category: { zh: string; en: string };// 产品分类（中/英）
  color: ProductColor;                 // 7 种便签色
  status: ProductStatus;               // live | soon | planned | archived
  isNew: boolean;                      // 新上线标记（NEW 角标）
  isWatched: boolean;                  // 关注标记（小火图标）
  launch: string;                      // 上线季度，如 "2026.Q1"
  demoUrl: string;                     // 预约演示外链
  desc: { zh: string; en: string };    // 产品描述（中/英）
  features: { zh: string[]; en: string[] }; // 核心特性（中/英）
}
```

数据库表结构（`products` / `team` / `partners`）见 `data/schema.sql`。

## 自托管字体

字体文件托管在 `public/fonts/`，不再依赖 Google Fonts CDN。`@font-face` 配合 `unicode-range` 让浏览器按字符范围自动选择子集：

| 字体 | latin 子集 | 中文子集 | 用途 |
|------|-----------|---------|------|
| ZCOOL KuaiLe | 5 KB | 709 KB | 标题 / 展示 |
| Patrick Hand | 23 KB | — | 英文装饰 |
| Caveat | 48 KB | — | 数字 / 装饰文字 |
| Noto Sans SC | 13 KB | 1116 KB | 中文正文 |

- 纯英文页面仅加载 latin 子集（总计 ~89 KB）。
- 中文页面额外加载中文子集（总计 ~1.8 MB），浏览器按字符自动选择。
- 所有字体使用 `font-display: swap`，避免 FOIT（不可见文本闪烁）。
- Patrick Hand 与 Caveat 本身不含中文字形，中文会自动回退到列表中的下一字体。

> **`assets/fonts/` 里的 TTF 是做什么的？**
>
> OG 图由 `ImageResponse`（底层渲染引擎为 satori）生成，satori 只解析 **TTF / OTF / WOFF**，
> **不支持 woff2**（会抛 `Unsupported OpenType signature wOF2`）。
> 因此额外保留了一份 TTF 专供构建期生成 OG 图；放在 `assets/` 而非 `public/` 下，
> 浏览器不会请求它，不影响页面加载体积。

## 功能特性

- **手写涂鸦风格**：便签纸质感 + 胶带/图钉装饰 + 手绘下划线 + 随意旋转角度
- **URL 中英文双语**：基于 `[lang]` 路由，服务端渲染、SEO 友好、无 hydration mismatch
- **产品搜索**：实时搜索产品名称与描述（中英文名称/描述/分类/特性）
- **产品筛选**：按状态筛选（全部 / 已上线 / 即将上线 / 规划中 / 已归档）
- **按分类分组**：产品列表按 `category` 分组展示
- **产品详情弹窗**：点击卡片查看完整描述与核心特性，支持下滑关闭
- **产品详情页**：`/products/[id]` 独立路由，按语言渲染，带背景色
- **关于我们**：团队介绍 + 联系方式 + 反馈入口
- **响应式布局**：移动端自动适配
- **移动端手势**：触摸缩放反馈、弹窗下滑关闭
- **Framer Motion 动画**：卡片入场、悬停、筛选切换动画
- **错误边界 / 404**：运行时错误友好提示（支持重新加载），按语言渲染
- **站点统计**：百度统计 + GA4（未配置时自动禁用）

## SEO 优化

- **Next.js Metadata API**：各页面用 `getTranslations` 在服务端按语言生成 title / description / canonical。
- **hreflang 多语言声明**：`lib/seo.ts` 的 `localeAlternates()` 统一生成 `canonical` + `alternates.languages`（zh / en / x-default），被 layout、首页、关于页、产品详情页四处复用，避免各写一份而漂移。
- **结构化数据（JSON-LD）**：
  - 全站：`WebSite`
  - 首页：`CollectionPage` + `ItemList`（产品列表）
  - 详情页：`Product`（含 image、offers、品牌）+ `BreadcrumbList`（首页 → 分类 → 产品）
  - 全部经 `safeJsonLd()` 转义，防止 `</script>` 提前闭合
- **sitemap.xml**：动态生成，覆盖首页、关于页与全部产品详情页；每个 URL 都带完整的 `xhtml:link` hreflang 组（自引用 + 其他语言 + `x-default`）。
- **robots.txt**：允许主流爬虫，禁止 `/api/`，声明 sitemap 位置。
- **Open Graph 动态图**：`app/[lang]/opengraph-image.tsx` 与 `app/[lang]/products/[id]/opengraph-image.tsx` 用 `ImageResponse` 按语言 / 产品生成 1200×630 分享图，Next.js 自动注入 `og:image` 及宽高、alt，无需在 metadata 里手写 `images`。
- **语义化 HTML**：`article` / `nav` / `main` / `h1` / `h2` 等正确标签。
- **语言回退**：非法 `[lang]` 自动回退默认语言，避免内容重复/缺页。

## 安全特性

- **安全响应头**（`next.config.js` headers）：`X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy: camera/microphone/geolocation=()`。
- **外部链接安全**：所有 `target="_blank"` 均配 `rel="noopener noreferrer"`。
- **无危险函数**：无 `eval()` / `innerHTML` / `document.write()`。
- **无敏感信息硬编码**：品牌信息统一在 `lib/site-config.ts`。
- **XSS 防护**：搜索关键词仅在 React 文本节点渲染；JSON-LD 序列化时转义 `<` `>` `&`（`lib/json-ld.ts`）。
- **路由越权防护**：不存在的产品 id 走 `notFound()` 返回 404；非法 `[lang]` 回退默认语言；无开放重定向。
- **数据读取兜底**：`safeQuery` 在 DB 异常时降级为安全默认值，不 500 整页。

## 测试体系

测试分布在 `test/` 下，覆盖单元、UI、可访问性（UE）与安全四类。

### 1. 单元测试（Vitest）

- 配置：`vitest.config.mts`（jsdom + `test/setup.ts`，对 `matchMedia` / `ResizeObserver` 做 polyfill）。
- 使用 `NextIntlClientProvider` 包裹组件并注入 messages mock。
- 覆盖：`getLocalizedProduct` 本地化、DB 层（mock `@libsql/client`）、LanguageSwitcher URL 切换、各组件文本渲染、messages 中英文键一致性。

```bash
npm test                 # 单次运行
npm run coverage         # 带覆盖率
```

### 2. UI / UE / 安全测试（Playwright）

- 配置：`playwright.config.ts`（`baseURL` + `webServer` 自动起 dev）。
- **`test/ui/`**：中/英首页加载、语言切换改变 URL、卡片点击弹窗、搜索过滤、筛选、关于页跳转、详情页按语言渲染。
- **`test/ue/`**：`@axe-core/playwright` 对全部路由做可访问性审计；移动（375）/ 桌面（1280）视口响应式断言 + 键盘可达性检查。
- **`test/security/`**：断言安全响应头、搜索框注入转义、非法 `[lang]` / 越权 id 兜底、无开放重定向。

```bash
npm run test:e2e
```

### 3. 测试报告

`test/report/generate-report.ts` 聚合 Vitest 与 Playwright 结果，生成含日期、通过/失败统计与覆盖率概要的聚合报告：

```bash
npx tsx test/report/generate-report.ts
```

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写：

```bash
# Turso 云数据库（生产环境）
# TURSO_DATABASE_URL=libsql://your-db.turso.io
# TURSO_AUTH_TOKEN=your-auth-token

# 本地开发：可留空，默认回退到 ./data/local.db
# TURSO_DATABASE_URL=file:./data/local.db

# 站点基础 URL（用于 SEO canonical / OpenGraph / sitemap）
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 站点统计（可选）
# NEXT_PUBLIC_BAIDU_ID=your-baidu-id
# NEXT_PUBLIC_GA_ID=your-ga-id
```

> 本地开发不配置 `TURSO_DATABASE_URL` 时，会自动使用 `file:./data/local.db`（需先 `npm run seed` 建表写数）。

## 自定义配置

### 品牌信息

编辑 `lib/site-config.ts` 统一修改品牌名、社交链接、仓库地址等：

```typescript
export const siteConfig = {
  author: "Layicr",
  heroSub: {zh: "...", en: "..."},       // 首页副标题（中/英）
  heroTitle: {zh: "产品矩阵", en: "Product Matrix"}, // 首页标题
  aboutSub: {zh: "...", en: "..."},      // 关于页副标题
  github: "https://github.com/layicr",
  twitter: "https://x.com/layicr",
  website: "https://www.lyc.la",
  repoUrl: "https://github.com/layicr/product-matrix",
  issuesUrl: "https://github.com/layicr/product-matrix/issues",
};
```

### 产品与团队数据

数据存于 libSQL，由 seed 脚本写入。新建 / 修改后运行 `npm run seed` 生效：

- `data/schema.sql`：建表语句（`products` / `team` / `partners`），字段说明的单一真源。
- `data/products-data.sql`：产品 `INSERT` 语句。
- `data/team-data.sql`：团队 `INSERT` 语句。
- `data/partners-data.sql`：合作伙伴 `INSERT` 语句。

`scripts/seed.ts` 会 `CREATE TABLE IF NOT EXISTS` 并执行 `INSERT ... ON CONFLICT(id) DO UPDATE`，因此可重复执行、幂等更新。

### 翻译文本

编辑 `messages/zh.json`（中文）与 `messages/en.json`，保持键集合一致（单测会校验）。组件内通过 `useTranslations()` / `getTranslations()` 取用，带插值键使用 next-intl 原生插值，如 `t("filter.count", { count })`。

## 部署到 Vercel

数据连接有两种方式，按需求选择：

### 方式 A：本地文件库（只读，零外部依赖）

适合纯展示、无需运行时写入的场景。已内置兼容处理：

- `data/local.db` 已加入 `.gitignore` 例外，会随仓库部署；
- `next.config.js` 的 `outputFileTracingIncludes` 会把它打进函数 bundle；
- `lib/db.ts` 在 Vercel（只读 FS）上自动把库复制到可写的 `/tmp/local.db` 再打开。

部署步骤：

1. 推送仓库到 GitHub。
2. 在 [Vercel](https://vercel.com) 导入仓库，框架选 Next.js（默认）。
3. 仅需配置 `NEXT_PUBLIC_SITE_URL`（必填）。
4. **无需**配置 `TURSO_*` 变量；运行时自动回退到 `file:./data/local.db`。
5. 点击 Deploy。

> ⚠️ 只读限制：Vercel 文件系统只读，方式 A 仅支持 `SELECT`，任何写入 / `npm run seed` 在线上会失败。需写数据时请用方式 B。

### 方式 B：Turso 云库（读写，推荐用于需更新的数据）

1. 同上导入仓库。
2. 配置环境变量：
   - `NEXT_PUBLIC_SITE_URL`（必填）
   - `TURSO_DATABASE_URL=libsql://你的库名.turso.io`（必填）
   - `TURSO_AUTH_TOKEN=你的令牌`（必填）
3. 在 Turso 中预置数据（本地 `npm run seed` 指向 Turso，或 `turso db shell` 导入 `data/*.sql`）。
4. 点击 Deploy。

环境变量在 Vercel 控制台 **Settings → Environment Variables** 设置（`.env` 已被 gitignore，不会被读取）。

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 代码注释规范

全站源码采用**中英双语注释**，便于国内外协作阅读。所有 `lib/`、`components/`、`app/` 下的 `.ts` / `.tsx` 文件均已覆盖。

| 位置 | 格式 | 说明 |
| --- | --- | --- |
| 文件头 | `//` 块注释 | 说明该文件职责；涉及安全/兼容性的会补充风险背景 |
| 导出函数 | JSDoc `/** ... */` | 先中文后英文，说明用途、参数与副作用 |
| 关键语句 | `//` 行内注释 | 解释「为什么这样写」，而非复述代码 |
| 类型字段 | 行尾 `//` | 说明字段含义与取值范围 |

示例：

```typescript
// 数据读取兜底：DB 不可达 / 超时 / 数据损坏时不让整页 500，降级为安全默认值。
// Data-read fallback: never 500 the whole page on DB outage / timeout / corrupt data;
// degrade to a safe default instead.
//
// 只用于「读多写死」的展示型查询。写操作不应吞异常。
// Only for read-only display queries. Writes must not swallow errors.
export async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  ...
}
```

**类型安全约定**：校验 locale 一律使用 `i18n/routing.ts` 导出的 `isLocale()` 类型守卫，**禁止** `as Locale` / `as "zh" | "en"` 断言。

```typescript
// ✅ 推荐
const locale = isLocale(lang) ? lang : "zh";

// ❌ 禁止
const locale = lang as "zh" | "en";
```

## 设计规范

- **风格**：手写涂鸦 / 便签纸质感
- **便签色**：8 种颜色（咖啡/靛蓝/皇家蓝/青绿/珊瑚/深红/品红/绿），定义在 `tailwind.config.ts` 的 `sticky-*`
- **中性色**：米白背景 `#FDF6E3` / 深墨文字 `#2C2C2C`
- **字体**：
  - 站酷快乐体 (ZCOOL KuaiLe) — 标题 / 展示
  - Patrick Hand — 英文装饰
  - Caveat — 数字 / 装饰文字
  - Noto Sans SC — 中文正文
- **装饰元素**：胶带、图钉、手绘下划线、便签纸、随意旋转角度
- **阴影**：便签纸阴影 `shadow-sticky`、按钮硬阴影 `shadow-hand-btn`
