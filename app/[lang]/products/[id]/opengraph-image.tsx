// 产品详情页 Open Graph 图（1200x630），按语言与产品动态生成。
// Product detail Open Graph image (1200x630), generated per locale and product.
//
// 覆盖父段 app/[lang]/opengraph-image.tsx 的默认图，让每个产品分享时显示自身标题。
// Overrides the parent app/[lang]/opengraph-image.tsx so each product shares with its own title.
import {ImageResponse} from "next/og";
import {getProductById, getAllProducts} from "@/lib/queries/products";
import {getLocalizedProduct} from "@/lib/localize";
import {colorHex} from "@/lib/colors";
import {isLocale, routing} from "@/i18n/routing";
import {siteConfig} from "@/lib/site-config";
import {loadHandFont} from "@/lib/og-font";
import {safeQuery} from "@/lib/safe-query";

export const size = {width: 1200, height: 630};
export const contentType = "image/png";

// alt 文本：OG 图的 alt 主要用于无障碍访问。
// 注意：satori 渲染的图片中文字已是图形，alt 不需要重复图片内所有文字。
// alt text: OG image alt is primarily for accessibility. The text in the image
// is already rendered as graphics, so the alt does not need to repeat everything.
export const alt = `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`;

// 显式组合 语言 × 产品，覆盖全部 OG 图。
// Explicitly combine locale × product to cover every OG image.
//
// 这里不能像 page.tsx 那样只返回 `{id}`：opengraph-image 是独立的路由段，
// 不会继承父段 [lang] 的 generateStaticParams，缺少 lang 会导致
// "Cannot find module for page" 构建失败。
// Unlike page.tsx, returning only `{id}` is not enough here: opengraph-image is a
// separate route segment that does not inherit the parent [lang] generateStaticParams,
// and a missing lang causes a "Cannot find module for page" build error.
export async function generateStaticParams() {
  const products = await safeQuery("getAllProducts", getAllProducts, []);

  const params: Array<{lang: string; id: string}> = [];
  for (const locale of routing.locales) {
    for (const product of products) {
      params.push({lang: locale, id: product.id});
    }
  }
  return params;
}

export default async function Image({
  params,
}: {
  params: Promise<{lang: string; id: string}>;
}) {
  const {lang, id} = await params;
  const locale = isLocale(lang) ? lang : "zh";

  // DB 异常或产品不存在时回退为品牌名，避免 OG 图生成失败拖垮整页。
  // Fall back to the brand name if the DB fails or the product is missing, so a
  // broken OG image never takes down the whole page.
  const product = await safeQuery("getProductById", () => getProductById(id), undefined);
  const localized = product ? getLocalizedProduct(product, locale) : null;
  const fontData = await loadHandFont();

  const title = localized?.name ?? siteConfig.heroTitle[locale];
  const category = localized?.category ?? "";
  const accent = product ? colorHex[product.color] : "#8D6E63";
  const num = product?.num ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#FDF6E3",
          border: "16px solid #2C2C2C",
        }}
      >
        {/* 产品色竖条 / Product color accent bar */}
        <div style={{display: "flex", width: 40, backgroundColor: accent}} />

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontFamily: "ZCOOL KuaiLe",
              color: "#555555",
            }}
          >
            {category}
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 88,
              fontFamily: "ZCOOL KuaiLe",
              color: "#2C2C2C",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 48,
              fontSize: 30,
              fontFamily: "ZCOOL KuaiLe",
              color: "#8D6E63",
            }}
          >
            {num ? `#${num} · ` : ""}
            {siteConfig.website}
          </div>
        </div>

        {/* 大号编号水印 / Large number watermark */}
        {num && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: 48,
              bottom: 24,
              fontSize: 190,
              fontFamily: "ZCOOL KuaiLe",
              color: "#2C2C2C",
              opacity: 0.08,
            }}
          >
            {num}
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [{name: "ZCOOL KuaiLe", data: fontData, style: "normal", weight: 400}],
    },
  );
}
