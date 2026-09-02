// 单元测试：i18n 配置与 messages 键完整性（zh/en 键集合一致、插值占位符结构一致）。
// Unit test: i18n config & message key integrity (zh/en key sets match; interpolation aligns).
import {describe, it, expect} from "vitest";
import zh from "@/messages/zh.json";
import en from "@/messages/en.json";
import {routing} from "@/i18n/routing";

/** 递归展开嵌套对象为点分 key 集合 */
function flattenKeys(obj: Record<string, unknown>, prefix = ""): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const child of flattenKeys(v as Record<string, unknown>, full)) {
        keys.add(child);
      }
    } else {
      keys.add(full);
    }
  }
  return keys;
}

describe("i18n 配置与消息完整性", () => {
  it("routing 支持 zh/en 且默认 zh", () => {
    expect(routing.locales).toEqual(["zh", "en"]);
    expect(routing.defaultLocale).toBe("zh");
  });

  it("zh 与 en 的翻译 key 集合完全一致", () => {
    const zhKeys = flattenKeys(zh as Record<string, unknown>);
    const enKeys = flattenKeys(en as Record<string, unknown>);
    expect([...zhKeys].sort()).toEqual([...enKeys].sort());
    expect(zhKeys.size).toBeGreaterThan(0);
  });

  it("每个翻译 key 在两种语言下均为非空字符串", () => {
    const zhKeys = flattenKeys(zh as Record<string, unknown>);
    for (const key of zhKeys) {
      const zhVal = key
        .split(".")
        .reduce<unknown>((acc, seg) => (acc as Record<string, unknown>)?.[seg], zh);
      const enVal = key
        .split(".")
        .reduce<unknown>((acc, seg) => (acc as Record<string, unknown>)?.[seg], en);
      expect(typeof zhVal).toBe("string");
      expect(typeof enVal).toBe("string");
      expect((zhVal as string).length).toBeGreaterThan(0);
      expect((enVal as string).length).toBeGreaterThan(0);
    }
  });

  it("含插值占位符的 key 在两种语言下结构一致（filter.count）", () => {
    expect((zh as Record<string, unknown>).filter).toHaveProperty("count");
    const zhCount = (zh as Record<string, {count: string}>).filter.count;
    const enCount = (en as Record<string, {count: string}>).filter.count;
    expect(zhCount).toContain("{count}");
    expect(enCount).toContain("{count}");
  });
});
