// 站点默认 Open Graph 图（1200x630），按语言动态生成。
// Site-wide default Open Graph image (1200x630), generated per locale.
//
// 采用 Next.js 的 opengraph-image 文件约定，Next.js 会自动把它注入该路由段及
// 其子路由的 metadata.openGraph.images，无需在 generateMetadata 里手写字段。
// Uses the Next.js opengraph-image file convention, which auto-injects it into
// metadata.openGraph.images for this segment and its children.
import {ImageResponse} from "next/og";
import {siteConfig} from "@/lib/site-config";
import {isLocale} from "@/i18n/routing";
import {loadHandFont} from "@/lib/og-font";

// 主流社交平台推荐尺寸 / Recommended size for major social platforms.
export const size = {width: 1200, height: 630};
export const contentType = "image/png";

// alt 文本：OG 图的 alt 主要用于无障碍访问，这里使用品牌名。
// 注意：satori 渲染的图片中文字已是图形，alt 不需要重复图片内所有文字。
// alt text: OG image alt is primarily for accessibility. The text in the image
// is already rendered as graphics, so the alt does not need to repeat everything.
export const alt = `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`;

export default async function Image({
  params,
}: {
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;
  const locale = isLocale(lang) ? lang : "zh";
  const fontData = await loadHandFont();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#FDF6E3",
          border: "16px solid #2C2C2C",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontFamily: "ZCOOL KuaiLe",
              color: "#2C2C2C",
            }}
          >
            {siteConfig.heroTitle[locale]}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              maxWidth: 900,
              fontSize: 38,
              fontFamily: "ZCOOL KuaiLe",
              color: "#555555",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {siteConfig.heroSub[locale]}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 28,
            fontFamily: "ZCOOL KuaiLe",
            color: "#8D6E63",
          }}
        >
          {siteConfig.website}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{name: "ZCOOL KuaiLe", data: fontData, style: "normal", weight: 400}],
    },
  );
}
