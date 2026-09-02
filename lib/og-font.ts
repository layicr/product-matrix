// OG 图字体加载：ImageResponse 需要显式提供字体二进制。
// OG image font loading: ImageResponse requires the font binary to be passed in.
//
// satori（ImageResponse 的渲染引擎）不读取系统字体，且默认字体不含 CJK 字形，
// 不传入中文字体的话，OG 图上的中文会渲染成空白或"豆腐块"。
// satori (the engine behind ImageResponse) does not read system fonts and its
// default font has no CJK glyphs — Chinese would render as blank boxes.
//
// 关键限制：satori 只解析 TTF / OTF / WOFF，**不支持 woff2**（woff2 用 Brotli 压缩，
// satori 未实现解压，会抛 "Unsupported OpenType signature wOF2"）。
// 因此这里单独使用一份 TTF，与 public/fonts/ 下供浏览器加载的 woff2 分开。
// Key limitation: satori parses TTF / OTF / WOFF only — **not woff2** (woff2 uses
// Brotli, which satori cannot decompress, throwing "Unsupported OpenType signature
// wOF2"). So we keep a separate TTF here, distinct from the woff2 in public/fonts/.
//
// 该文件仅构建期用于生成静态 OG 图，放在 assets/ 而非 public/ 下，
// 不会被浏览器请求，不增加线上加载负担。
// Used only at build time to render static OG images; kept under assets/ (not
// public/) so browsers never request it and page weight is unaffected.
import {readFile} from "node:fs/promises";
import {join} from "node:path";

/** 构建期缓存，避免每张 OG 图都重复读盘 / Build-time cache to avoid re-reading per image. */
let cached: Buffer | null = null;

/**
 * 加载 ZCOOL KuaiLe 中文 TTF 字体。
 * Load the ZCOOL KuaiLe CJK TTF font.
 */
export async function loadHandFont(): Promise<Buffer> {
  if (cached) return cached;

  const fontPath = join(
    process.cwd(),
    "assets",
    "fonts",
    "zcool-kuaile-v22-chinese-simplified-regular.ttf",
  );
  cached = await readFile(fontPath);
  return cached;
}
