import type { MetadataRoute } from "next";
import {absoluteUrl} from "@/lib/site-url";

// 动态生成 robots.txt：允许主流爬虫，禁止 /api/。
// Dynamically generate robots.txt: allow major crawlers, disallow /api/.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
