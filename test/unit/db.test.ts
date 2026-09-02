// 测试：libSQL 单例客户端 getDb / setDb。
// Test: libSQL singleton client getDb / setDb.
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {setDb, getDb} from "@/lib/db";
import type {Client} from "@libsql/client";

// mock @libsql/client，避免拉取原生依赖
vi.mock("@libsql/client", () => ({
  createClient: vi.fn((config: unknown) => ({__config: config})),
}));

describe("db singleton", () => {
  const originalUrl = process.env.TURSO_DATABASE_URL;
  const originalToken = process.env.TURSO_AUTH_TOKEN;

  beforeEach(() => {
    setDb(null);
  });

  afterEach(() => {
    setDb(null);
    if (originalUrl === undefined) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = originalUrl;
    if (originalToken === undefined) delete process.env.TURSO_AUTH_TOKEN;
    else process.env.TURSO_AUTH_TOKEN = originalToken;
  });

  it("未配置 TURSO_DATABASE_URL 时回退到本地文件", () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    const db = getDb();
    expect((db as {__config?: {url?: string}}).__config?.url).toBe(
      "file:./data/local.db",
    );
  });

  it("配置 TURSO_DATABASE_URL 时使用远程地址", () => {
    process.env.TURSO_DATABASE_URL = "libsql://demo.example.com";
    process.env.TURSO_AUTH_TOKEN = "token-abc";
    const db = getDb();
    expect((db as {__config?: {url?: string; authToken?: string}}).__config).toMatchObject({
      url: "libsql://demo.example.com",
      authToken: "token-abc",
    });
  });

  it("getDb 返回单例（多次调用为同一实例）", () => {
    delete process.env.TURSO_DATABASE_URL;
    const a = getDb();
    const b = getDb();
    expect(a).toBe(b);
  });

  it("setDb 可注入 mock 客户端并使其成为单例", () => {
    const mock = {__config: {url: "mock://"}} as unknown as Client;
    setDb(mock);
    expect(getDb()).toBe(mock);
  });
});
