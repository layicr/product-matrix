// 单元测试：lib/utils 的 cn 类名合并工具（clsx + tailwind-merge）。
// Unit test: lib/utils cn class-merge helper (clsx + tailwind-merge).
import {describe, it, expect} from "vitest";
import {cn} from "@/lib/utils";

describe("cn", () => {
  it("合并多个类名", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("跳过 falsy 值（条件类名）", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("tailwind-merge 解决冲突类名（后者胜出）", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("支持数组与对象语法（clsx）", () => {
    expect(cn(["x", "y"], {z: true, w: false})).toBe("x y z");
  });
});
