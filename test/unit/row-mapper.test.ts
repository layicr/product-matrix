// 单元测试：lib/queries/row-mapper 行映射工具（localizedField / nullableField）。
// Unit test: lib/queries/row-mapper row mapping helpers (localizedField / nullableField).
import {describe, it, expect} from "vitest";
import {localizedField, nullableField} from "@/lib/queries/row-mapper";

describe("localizedField", () => {
  it("从行中按前缀提取 { zh, en } 文本对", () => {
    const row = {
      name_zh: "张明远",
      name_en: "Mingyuan Zhang",
      ord: 1,
    };
    expect(localizedField(row, "name")).toEqual({
      zh: "张明远",
      en: "Mingyuan Zhang",
    });
  });

  it("缺失的字段被转成字符串（不抛错）", () => {
    const row = {name_zh: "只有中文"};
    expect(localizedField(row, "name").zh).toBe("只有中文");
    // String(undefined) === "undefined"，与 SQLite 空列语义一致（保持稳定）。
    expect(typeof localizedField(row, "name").en).toBe("string");
  });
});

describe("nullableField", () => {
  it("null 值返回 null", () => {
    expect(nullableField({logo: null}, "logo")).toBeNull();
  });

  it("undefined 值返回 null", () => {
    expect(nullableField({}, "url")).toBeNull();
  });

  it("非空值转为字符串", () => {
    expect(nullableField({logo: "logo.png"}, "logo")).toBe("logo.png");
    expect(nullableField({count: 3}, "count")).toBe("3");
  });
});
