// 测试：手绘按钮公共样式常量。
// Test: shared hand-drawn button style constant.
import {describe, it, expect} from "vitest";
import {handButtonBase} from "@/lib/styles";

describe("handButtonBase", () => {
  it("包含手绘按钮关键样式类", () => {
    expect(handButtonBase).toContain("border-[2.5px]");
    expect(handButtonBase).toContain("border-ink");
    expect(handButtonBase).toContain("shadow-hand-btn");
  });

  it("包含悬停动效类（上移微移）", () => {
    expect(handButtonBase).toContain("hover:-translate-x-0.5");
    expect(handButtonBase).toContain("hover:-translate-y-0.5");
  });
});
