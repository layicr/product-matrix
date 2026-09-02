import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// PWA manifest 配置 / PWA manifest configuration.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.heroTitle.zh} ${siteConfig.heroTitle.en}`,
    short_name: siteConfig.heroTitle.zh,
    description: `${siteConfig.heroSub.zh} ${siteConfig.heroSub.en}`,
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0E8",
    theme_color: "#1A1A1A",
    lang: "zh-CN",
    // 此前引用 /icon-192.png 与 /icon-512.png，但 public/ 下并无这些文件 → 图标 404。
    // Previously referenced /icon-192.png & /icon-512.png, which did not exist → 404s.
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
