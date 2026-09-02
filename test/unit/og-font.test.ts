// 测试：OG 图手绘中文字体加载。
// Test: loading the hand-drawn CJK font used in OG images.
import {describe, it, expect} from "vitest";

// 说明：不 mock node:fs/promises。
// Note: we intentionally do NOT mock node:fs/promises here.
// Vitest 对 node 内置模块默认 externalize，vi.mock 只拦截测试文件自身的动态
// import，无法替换被测试模块内部的静态导入（og-font.ts 里的
// `import {readFile} from "node:fs/promises"` 始终拿到真实 readFile），
// 因此 mock 计数恒为 0。改用行为断言：若第二次调用真的重新读盘，
// readFile 会返回新的 Buffer 实例，`toBe` 引用相等即可证明命中缓存。
// Vitest externalizes node built-ins, so vi.mock only affects dynamic imports
// in the test file, never the static import inside og-font.ts (it always gets
// the real readFile, mock call count stays 0). We instead assert by reference:
// a real re-read would produce a NEW Buffer instance, so `toBe` equality of
// the two results proves the cache was hit.

describe("loadHandFont", () => {
  it("从 assets/fonts 读取 ZCOOL KuaiLe TTF 并返回 Buffer", async () => {
    const {loadHandFont} = await import("@/lib/og-font");
    const font = await loadHandFont();
    expect(Buffer.isBuffer(font)).toBe(true);
    // TTF 魔数 0x00010000（OpenType）；这里至少验证非空且足够大
    expect(font.length).toBeGreaterThan(1000);
  });

  it("重复调用命中缓存，不重复读盘（引用相同即未重新读盘）", async () => {
    const {loadHandFont} = await import("@/lib/og-font");
    const first = await loadHandFont();
    const second = await loadHandFont();

    // 若第二次重新 readFile，会得到新 Buffer 实例；引用相等即证明命中缓存
    expect(second).toBe(first);
  });
});
