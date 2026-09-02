// 单元测试：lib/status 状态配置与「核心产品」判定（单一真源）。
// Unit test: lib/status config and core-product predicate (single source of truth).
import {describe, it, expect} from "vitest";
import {
  statusConfig,
  NON_ACTIVE_STATUSES,
  isActiveProduct,
  isLiveProduct,
} from "@/lib/status";
import type {ProductStatus} from "@/lib/types";

const STATUSES: ProductStatus[] = ["live", "soon", "planned", "archived"];

describe("statusConfig", () => {
  it("覆盖全部四种产品状态", () => {
    for (const s of STATUSES) {
      expect(statusConfig[s]).toBeDefined();
      expect(statusConfig[s].labelKey).toBe(`status.${s}`);
      expect(statusConfig[s].bg).toMatch(/^bg-(sticky-|white\/)/);
    }
  });
});

describe("NON_ACTIVE_STATUSES", () => {
  it("仅含 archived 与 planned", () => {
    expect([...NON_ACTIVE_STATUSES].sort()).toEqual(["archived", "planned"]);
  });
});

describe("isActiveProduct", () => {
  it("live / soon 计入核心产品", () => {
    expect(isActiveProduct({status: "live"})).toBe(true);
    expect(isActiveProduct({status: "soon"})).toBe(true);
  });

  it("planned / archived 不计入核心产品", () => {
    expect(isActiveProduct({status: "planned"})).toBe(false);
    expect(isActiveProduct({status: "archived"})).toBe(false);
  });
});

describe("isLiveProduct", () => {
  it("仅 live 为真", () => {
    expect(isLiveProduct({status: "live"})).toBe(true);
    expect(isLiveProduct({status: "soon"})).toBe(false);
    expect(isLiveProduct({status: "planned"})).toBe(false);
    expect(isLiveProduct({status: "archived"})).toBe(false);
  });
});
