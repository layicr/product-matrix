# Product Matrix

English | [简体中文](./README.md)

A doodle / sticky-note style fintech product matrix showcase, built on **Next.js 16 (App Router)**. Features URL-based bilingual content (zh/en via next-intl), a libSQL / Turso powered data layer, and a comprehensive test suite (unit / UI / accessibility / security).

## Tech Stack

- **Framework**: Next.js 16.3.3 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS 3
- **UI**: shadcn/ui (built on Radix UI)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **i18n**: [`next-intl`](https://next-intl.dev) v4 — URL-based `[lang]` dynamic routes, SSR translations, type-safe keys
- **Database**: `@libsql/client` — Turso cloud (`libsql://`) & local file DB (`file:`)
- **Testing**: Vitest (unit), @playwright/test (UI / a11y / security), @axe-core/playwright (accessibility audit), @vitest/coverage-v8
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Prepare env vars (falls back to ./data/local.db locally — optional)
cp .env.example .env.local

# Initialize / write product & team data to local libSQL
npm run seed

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Opens at http://localhost:3000 — redirects to the default locale `http://localhost:3000/zh`.

Common scripts (`package.json`):

| Script | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` / `npm start` | Build / start production |
| `npm run lint` | ESLint |
| `npm run seed` | Run `scripts/seed.ts` to create tables and load `data/*.sql` |
| `npm test` / `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:watch` | Vitest watch mode |
| `npm run coverage` | Unit tests with coverage |
| `npm run test:e2e` | Playwright UI / a11y / security tests |

## Project Structure

```
product-matrix/
├── app/
│   ├── [lang]/                       # All pages live under the locale segment
│   │   ├── layout.tsx                # Locale layout: root-params + NextIntlClientProvider + generateMetadata
│   │   ├── page.tsx                  # Home (Server Component, awaits data → HomeClient, with JSON-LD)
│   │   ├── not-found.tsx             # Locale-scoped 404
│   │   ├── opengraph-image.tsx       # Site-wide default OG image (1200x630, per locale)
│   │   ├── about/page.tsx            # About page (team / contact)
│   │   └── products/[id]/
│   │       ├── page.tsx              # Product detail (dynamic metadata + Product / Breadcrumb JSON-LD)
│   │       └── opengraph-image.tsx   # Per-product OG image (per product & locale)
│   ├── layout.tsx                    # Root layout (fonts + global styles)
│   ├── error.tsx                     # Error boundary (IntlFallbackProvider + LocaleSync fallback)
│   ├── not-found.tsx                 # Root 404 (IntlFallbackProvider + LocaleSync fallback)
│   ├── globals.css                   # Global styles (self-hosted fonts + doodle style)
│   ├── manifest.ts                   # PWA manifest
│   ├── sitemap.ts                    # Dynamic sitemap.xml (with zh/en alternates)
│   └── robots.ts                     # Dynamic robots.txt
├── components/
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   ├── analytics.tsx                 # Site analytics (Baidu + GA4; returns null when unconfigured)
│   ├── home-client.tsx               # Home interactions (Client Component, products via props)
│   ├── navbar.tsx                    # Navigation bar
│   ├── hero.tsx                      # Hero section
│   ├── search-bar.tsx                # Search bar
│   ├── filter-bar.tsx                # Status filter bar (native interpolation)
│   ├── product-card.tsx              # Product card
│   ├── product-grid.tsx              # Product grid grouped by category
│   ├── product-dialog.tsx            # Product dialog (swipe to close)
│   ├── popup-intro.tsx               # Homepage popup animation (gift box → explosion → sticky note card)
│   ├── language-switcher.tsx         # Language switcher (URL navigation / alternates)
│   ├── footer.tsx                    # Footer
│   ├── floating-actions.tsx          # Bottom-right FABs (feedback + back to top)
│   └── swipe-gestures.tsx            # Site-wide touch gesture (fast flick to top/bottom)
├── i18n/
│   ├── routing.ts                    # locales: ['zh','en'], defaultLocale: 'zh', isLocale type guard
│   └── navigation.ts                 # Link/useRouter/usePathname bound to routing
├── i18n.ts                           # next-intl getRequestConfig (Next.js 16 root-params)
├── middleware.ts                     # next-intl locale detection & redirect (URL [lang] → cookie → Accept-Language → default zh)
├── lib/
│   ├── db.ts                         # libSQL singleton client (env-aware, falls back to file:./data/local.db)
│   ├── queries/                      # Data access layer (async + unstable_cache 60s)
│   │   ├── products.ts               # getAllProducts / getActiveProductCount / getProductById
│   │   ├── team.ts                   # getTeam
│   │   ├── partners.ts               # getPartners
│   │   └── row-mapper.ts             # DB row mapper (_zh/_en columns → {zh, en} shape)
│   ├── localize.ts                   # Pure function getLocalizedProduct(product, lang)
│   ├── types/                        # Domain types
│   │   ├── product.ts                # Product / ProductStatus / ProductColor
│   │   ├── team.ts                   # TeamMember
│   │   └── partner.ts                # Partner
│   ├── colors.ts                     # Sticky-note color map (colorMap)
│   ├── status.ts                     # Status config + single source of truth for "core product"
│   ├── filters.ts                    # Single source of truth for filter keys (FILTER_KEYS / FilterKey)
│   ├── search.ts                     # Pure search-matching function productMatchesQuery
│   ├── about-stats.ts                # About page stats builder
│   ├── site-config.ts                # Global site config (brand name, social links, etc.)
│   ├── site-url.ts                   # Base site URL helper (absoluteUrl)
│   ├── seo.ts                        # hreflang & alternates builder (bilingual SEO single source)
│   ├── og-font.ts                    # OG image font loading (satori supports TTF/OTF/WOFF only)
│   ├── safe-query.ts                 # Data-read fallback (degrades to a safe default on DB failure)
│   ├── json-ld.ts                    # Safe JSON-LD serialization (XSS protection)
│   ├── styles.ts                     # Doodle style constants
│   ├── utils.ts                      # cn() helper (clsx + tailwind-merge)
│   ├── intl-fallback.tsx             # Fallback Intl Provider (used by error / not-found)
│   ├── locale-sync.tsx               # Syncs <html lang> from the URL (used by error / not-found)
│   └── hooks/
│       └── use-swipe.ts              # Touch swipe gesture hook
├── data/
│   ├── schema.sql                    # CREATE TABLE for products / team / partners (single source)
│   ├── products-data.sql             # Product seed data (INSERT)
│   ├── team-data.sql                 # Team seed data (INSERT)
│   └── partners-data.sql             # Partner seed data (INSERT)
├── assets/
│   └── fonts/                        # TTF used only at build time for OG images (satori has no woff2 support)
│       └── zcool-kuaile-v22-chinese-simplified-regular.ttf
├── messages/
│   ├── zh.json                       # Chinese translations
│   └── en.json                       # English translations
├── public/
│   ├── fonts/                        # Self-hosted fonts (latin + CJK subsets, loaded on demand via unicode-range)
│   │   ├── zcool-kuaile-v22-latin-regular.woff2
│   │   ├── zcool-kuaile-v22-chinese-simplified-regular.woff2
│   │   ├── patrick-hand-v25-latin-regular.woff2
│   │   ├── caveat-v23-latin-regular.woff2
│   │   ├── noto-sans-sc-v40-latin-regular.woff2
│   │   └── noto-sans-sc-v40-chinese-simplified-regular.woff2
│   └── icon.svg                      # Site icon
├── scripts/
│   └── seed.ts                       # Create tables + upsert products / team / partners
├── test/
│   ├── unit/                         # Vitest unit tests
│   ├── ui/                           # Playwright UI E2E
│   ├── ue/                           # Playwright accessibility / responsive / keyboard navigation
│   ├── security/                     # Playwright security tests (headers / XSS / route access)
│   ├── report/                       # Report aggregation (generate-report.ts)
│   ├── setup.ts                      # Test polyfills + renderWithIntl helper
│   └── utils.tsx                     # Test utilities
├── .env.example                      # Environment variable template
├── next.config.js                    # createNextIntlPlugin + security headers
├── vitest.config.mts                 # Vitest config (jsdom + setup)
├── playwright.config.ts              # Playwright config (baseURL + webServer)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── components.json
```

## Internationalization (next-intl)

Uses the official `[lang]` dynamic segment approach — the locale lives in the URL, so the server is aware of it.

- **`i18n/routing.ts`**: declares `locales: ['zh', 'en']` and `defaultLocale: 'zh'`, and exports the `isLocale()` type guard.
- **`i18n.ts`**: `getRequestConfig` uses the Next.js 16 `root-params` approach to read the locale from the `[lang]` root segment, calling `notFound()` for invalid or missing values.
- **`middleware.ts`**: the official next-intl `[lang]`-route locale detection and redirect, in priority order `URL [lang]` → `NEXT_LOCALE` cookie → `Accept-Language` → default `zh`. Because this repo uses the `[lang]` dynamic segment, middleware is a required component (there is no `proxy` alternative).
- **`i18n/navigation.ts`**: provides `Link` / `useRouter` / `usePathname` bound to `routing`.
- **Components**: Server Components use `getTranslations` for metadata; Client Components use `useTranslations` / `useLocale`.
- **Switching**: `language-switcher.tsx` navigates to `/{locale}/{rest}` via `usePathname` / `useRouter`, preserving the current path.
- **`messages/zh.json` / `en.json`**: the single source of translation keys, validated at build time by `createNextIntlPlugin`.

## Data Layer (libSQL / Turso)

Products, team, and partners are read from libSQL at runtime and can be updated dynamically.

- **`lib/db.ts`**: keeps a **module-level singleton** via `@libsql/client`'s `createClient`; the URL comes from `process.env.TURSO_DATABASE_URL`, falling back to `file:./data/local.db`; `authToken` comes from `TURSO_AUTH_TOKEN`. On read-only filesystems like Vercel, a `file:` DB is first copied to the writable `/tmp/local.db` and opened read-only (read-only scenarios only).
- **`lib/queries/products.ts`**:
  - `getAllProducts(): Promise<Product[]>` — ordered by `num` ascending.
  - `getActiveProductCount(): Promise<number>` — core product count (excludes archived / planned).
  - `getProductById(id): Promise<Product | undefined>`.
  - All cached for 60s with `unstable_cache`.
- **`lib/queries/team.ts`**: `getTeam()` — team ordered by `ord`.
- **`lib/queries/partners.ts`**: `getPartners()` — partners.
- **`lib/queries/row-mapper.ts`**: `localizedField(row, prefix)` re-groups `_zh/_en` columns into a `{zh, en}` shape.
- **`lib/localize.ts`**: `getLocalizedProduct(product, lang)` — a **pure function** (no DB access) that flattens the `{zh, en}` shape into single-language fields.
- **`lib/safe-query.ts`**: `safeQuery<T>(label, fn, fallback)` — degrades to a safe default on DB failure instead of 500-ing the page.

`Product` is defined in `lib/types/product.ts`:

```typescript
type ProductStatus = "live" | "soon" | "planned" | "archived";

interface Product {
  id: string;                          // Unique product id, e.g. p0001
  num: string;                         // Display number, e.g. "01"
  name: { zh: string; en: string };    // Product name (zh/en)
  category: { zh: string; en: string };// Product category (zh/en)
  color: ProductColor;                 // 7 sticky-note colors
  status: ProductStatus;               // live | soon | planned | archived
  isNew: boolean;                      // Newly launched flag (NEW badge)
  isWatched: boolean;                  // Watched flag (flame badge)
  launch: string;                      // Launch quarter, e.g. "2026.Q1"
  demoUrl: string;                     // Demo booking link
  desc: { zh: string; en: string };    // Description (zh/en)
  features: { zh: string[]; en: string[] }; // Key features (zh/en)
}
```

See `data/schema.sql` for the `products` / `team` / `partners` table definitions.

## Self-Hosted Fonts

Fonts are self-hosted in `public/fonts/`, with no dependency on the Google Fonts CDN. `@font-face` combined with `unicode-range` lets the browser pick the right subset per character range:

| Font | latin subset | CJK subset | Usage |
|------|-------------|-----------|-------|
| ZCOOL KuaiLe | 5 KB | 709 KB | Headings / display |
| Patrick Hand | 23 KB | — | English decoration |
| Caveat | 48 KB | — | Numbers & decor |
| Noto Sans SC | 13 KB | 1116 KB | Chinese body text |

- English-only pages load just the latin subsets (~89 KB total).
- Chinese pages additionally load the CJK subsets (~1.8 MB total); the browser selects per character.
- All fonts use `font-display: swap` to avoid FOIT.
- Patrick Hand and Caveat ship no CJK glyphs, so Chinese text falls back to the next font in the stack.

> **What is the TTF in `assets/fonts/` for?**
>
> OG images are rendered by `ImageResponse` (satori), which parses **TTF / OTF / WOFF** only —
> **not woff2** (it throws `Unsupported OpenType signature wOF2`).
> A separate TTF is therefore kept for build-time OG generation under `assets/`, not `public/`,
> so browsers never fetch it and page weight is unaffected.

## Features

- **Doodle style**: sticky-note texture + tape/pin decorations + hand-drawn underlines + casual rotation
- **URL-based bilingual content**: `[lang]` routing, SSR, SEO-friendly, no hydration mismatch
- **Product search**: live search across names and descriptions (zh/en name / description / category / features)
- **Product filter**: filter by status (all / live / soon / planned / archived)
- **Grouped by category**: the product list is grouped by `category`
- **Product dialog**: click a card for the full description and key features; swipe down to close
- **Product detail page**: standalone `/products/[id]` route, rendered per locale with a colored background
- **About**: team intro + contact info + feedback entry point
- **Responsive layout**: adapts to mobile automatically
- **Touch gestures**: pinch feedback, swipe-down-to-close for dialogs
- **Framer Motion animations**: card entrance, hover, and filter transitions
- **Error boundary / 404**: friendly runtime error page (with reload), rendered per locale
- **Analytics**: Baidu Tongji + GA4 (disabled automatically when unconfigured)

## SEO

- **Next.js Metadata API**: each page generates title / description / canonical per locale via `getTranslations`.
- **hreflang annotations**: `localeAlternates()` in `lib/seo.ts` builds `canonical` + `alternates.languages` (zh / en / x-default) in one place, reused by the layout, home, about, and product detail pages so the four cannot drift apart.
- **Structured data (JSON-LD)**:
  - Site-wide: `WebSite`
  - Home: `CollectionPage` + `ItemList` (product list)
  - Product detail: `Product` (with image, offers, brand) + `BreadcrumbList` (home → category → product)
  - All escaped through `safeJsonLd()` so a `</script>` cannot close the tag early
- **sitemap.xml**: generated dynamically, covering the home, about, and every product page; each URL carries a full `xhtml:link` hreflang group (self-referential + other locales + `x-default`).
- **robots.txt**: allows major crawlers, disallows `/api/`, and declares the sitemap location.
- **Dynamic Open Graph images**: `app/[lang]/opengraph-image.tsx` and `app/[lang]/products/[id]/opengraph-image.tsx` render 1200×630 share images per locale / product with `ImageResponse`; Next.js injects `og:image` plus width, height, and alt automatically — no hand-written `images` field needed.
- **Semantic HTML**: `article` / `nav` / `main` / `h1` / `h2` and other correct tags.
- **Locale fallback**: an invalid `[lang]` falls back to the default locale, avoiding duplicate or missing pages.

## Security

- **Security headers** (`next.config.js`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera/microphone/geolocation=()`.
- **Safe external links**: every `target="_blank"` is paired with `rel="noopener noreferrer"`.
- **No dangerous functions**: no `eval()` / `innerHTML` / `document.write()`.
- **No hardcoded secrets**: brand info lives in `lib/site-config.ts`.
- **XSS protection**: search keywords render only as React text nodes; JSON-LD escapes `<` `>` `&` (`lib/json-ld.ts`).
- **Route access control**: unknown product ids go through `notFound()` (404); invalid `[lang]` falls back to the default locale; no open redirects.
- **Data-read fallback**: `safeQuery` degrades to a safe default on DB failure instead of 500-ing the page.

## Testing

Tests live under `test/` and cover four categories: unit, UI, accessibility (UE), and security.

### 1. Unit Tests (Vitest)

- Config: `vitest.config.mts` (jsdom + `test/setup.ts`, polyfilling `matchMedia` / `ResizeObserver`).
- Components are wrapped in `NextIntlClientProvider` with mocked messages.
- Coverage: `getLocalizedProduct` localization, DB layer (mocking `@libsql/client`), LanguageSwitcher URL switching, component text rendering, and zh/en message key parity.

```bash
npm test                 # Single run
npm run coverage         # With coverage
```

### 2. UI / Accessibility / Security Tests (Playwright)

- Config: `playwright.config.ts` (`baseURL` + `webServer` auto-starts dev).
- **`test/ui/`**: zh/en home loading, language switch changes the URL, card click opens dialog, search filtering, filtering, about navigation, detail page rendering per locale.
- **`test/ue/`**: `@axe-core/playwright` accessibility audit across all routes; responsive assertions at mobile (375) / desktop (1280) plus keyboard reachability.
- **`test/security/`**: asserts security headers, search input escaping, invalid `[lang]` / out-of-range id fallbacks, and no open redirects.

```bash
npm run test:e2e
```

### 3. Test Report

`test/report/generate-report.ts` aggregates the Vitest and Playwright results into a report with the date, pass/fail counts, and a coverage summary:

```bash
npx tsx test/report/generate-report.ts
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in what you need:

```bash
# Turso cloud DB (production)
# TURSO_DATABASE_URL=libsql://your-db.turso.io
# TURSO_AUTH_TOKEN=your-auth-token

# Local development: leave empty to fall back to ./data/local.db
# TURSO_DATABASE_URL=file:./data/local.db

# Site base URL (for SEO canonical / OpenGraph / sitemap)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Analytics (optional)
# NEXT_PUBLIC_BAIDU_ID=your-baidu-id
# NEXT_PUBLIC_GA_ID=your-ga-id
```

> With `TURSO_DATABASE_URL` unset, local development uses `file:./data/local.db` (run `npm run seed` first to create tables and load data).

## Customization

### Brand Info

Edit `lib/site-config.ts` to change the brand name, social links, repository URL, and so on in one place:

```typescript
export const siteConfig = {
  author: "Layicr",
  heroSub: {zh: "...", en: "..."},       // Hero subtitle (zh/en)
  heroTitle: {zh: "产品矩阵", en: "Product Matrix"}, // Hero title
  aboutSub: {zh: "...", en: "..."},      // About subtitle
  github: "https://github.com/layicr",
  twitter: "https://x.com/layicr",
  website: "https://www.lyc.la",
  repoUrl: "https://github.com/layicr/product-matrix",
  issuesUrl: "https://github.com/layicr/product-matrix/issues",
};
```

### Product & Team Data

Data lives in libSQL and is written by the seed script. After adding or editing, run `npm run seed`:

- `data/schema.sql`: `CREATE TABLE` for `products` / `team` / `partners` — the single source of field definitions.
- `data/products-data.sql`: product `INSERT` statements.
- `data/team-data.sql`: team `INSERT` statements.
- `data/partners-data.sql`: partner `INSERT` statements.

`scripts/seed.ts` runs `CREATE TABLE IF NOT EXISTS` and `INSERT ... ON CONFLICT(id) DO UPDATE`, so it is repeatable and idempotent.

### Translations

Edit `messages/zh.json` (Chinese) and `messages/en.json` (English), keeping the key sets in sync (a unit test verifies this). Components read them via `useTranslations()` / `getTranslations()`; keys with placeholders use next-intl's native interpolation, e.g. `t("filter.count", { count })`.

## Deploy to Vercel

There are two ways to connect the database, pick one:

### Option A: Local file DB (read-only, zero external dependency)

Best for showcase sites with no runtime writes. Compatibility is already built in:

- `data/local.db` is added as a `.gitignore` exception, so it ships with the repo;
- `next.config.js`'s `outputFileTracingIncludes` bundles it into the function;
- `lib/db.ts` automatically copies the DB to the writable `/tmp/local.db` and opens it read-only on Vercel (read-only FS).

Steps:

1. Push the repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com) and select the Next.js preset (defaults).
3. Only `NEXT_PUBLIC_SITE_URL` is required.
4. **Do not** set `TURSO_*` vars — it falls back to `file:./data/local.db` at runtime.
5. Click Deploy.

> ⚠️ Read-only limit: Vercel's filesystem is read-only, so Option A supports `SELECT` only; any write / `npm run seed` fails in production. Use Option B when writes are needed.

### Option B: Turso cloud DB (read/write, recommended for mutable data)

1. Import the repo as above.
2. Configure env vars:
   - `NEXT_PUBLIC_SITE_URL` (required)
   - `TURSO_DATABASE_URL=libsql://your-db.turso.io` (required)
   - `TURSO_AUTH_TOKEN=your-auth-token` (required)
3. Pre-seed the data in Turso (run `npm run seed` pointed at Turso locally, or import `data/*.sql` via `turso db shell`).
4. Click Deploy.

Env vars are set in the Vercel dashboard under **Settings → Environment Variables** (`.env` is gitignored and not read by Vercel).

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Code Comment Convention

Source code uses **bilingual (Chinese + English) comments** throughout. All `.ts` / `.tsx` files under `lib/`, `components/`, and `app/` are covered.

| Scope | Format | Notes |
| --- | --- | --- |
| File header | `//` block comment | Describes the file's responsibility; security/compatibility notes included where relevant |
| Exported fn | JSDoc `/** ... */` | Chinese first, then English; covers purpose, parameters, and side effects |
| Key statements | `//` inline | Explains *why* the code is written this way rather than restating it |
| Type fields | Trailing `//` | Describes the field's meaning and value range |

Example:

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

**Type-safety convention**: always validate locales with the `isLocale()` type guard exported from `i18n/routing.ts`; `as Locale` / `as "zh" | "en"` assertions are **prohibited**.

```typescript
// ✅ Preferred
const locale = isLocale(lang) ? lang : "zh";

// ❌ Prohibited
const locale = lang as "zh" | "en";
```

## Design Spec

- **Style**: doodle / sticky-note
- **Sticky colors**: 8 colors (coffee/slate/royalBlue/turquoise/coral/crimson/magenta/green), defined as `sticky-*` in `tailwind.config.ts`
- **Neutrals**: cream background `#FDF6E3` / dark ink text `#2C2C2C`
- **Fonts**:
  - ZCOOL KuaiLe — headings / display
  - Patrick Hand — English decoration
  - Caveat — numbers & decor
  - Noto Sans SC — Chinese body text
- **Decor**: tape, pins, hand-drawn underlines, sticky notes, casual rotation
- **Shadows**: `shadow-sticky` for notes, `shadow-hand-btn` for buttons

## License

MIT
