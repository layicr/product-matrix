// 站点统计：百度统计 + Google Analytics（GA4）。
// Site analytics: Baidu Tongji + Google Analytics (GA4).
// 通过环境变量启用；未配置时返回 null，完全不注入，保持隐藏、无可见元素。
// Enabled via env vars; returns null when unconfigured, so nothing is injected (hidden, no visible UI).
import Script from "next/script";

const BAIDU_ID = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function SiteAnalytics() {
  if (!BAIDU_ID && !GA_ID) return null;

  return (
    <>
      {BAIDU_ID && (
        <>
          <Script id="baidu-tongji" strategy="afterInteractive">
            {`var _hmt = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${BAIDU_ID}";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();`}
          </Script>
          <noscript>
            {/* 无 JS 兜底：1x1 透明像素，display:none 完全隐藏 / No-JS fallback: 1x1 transparent pixel, hidden. */}
            <img
              src={`https://hm.baidu.com/hm.gif?si=${BAIDU_ID}`}
              style={{display: "none"}}
              alt=""
            />
          </noscript>
        </>
      )}

      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
