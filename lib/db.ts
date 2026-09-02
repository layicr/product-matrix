import {createClient, type Client} from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

let client: Client | null = null;

/**
 * 获取 libSQL 单例客户端 / Get the singleton libSQL client.
 *
 * - 生产环境：TURSO_DATABASE_URL（libsql://...）+ TURSO_AUTH_TOKEN
 *   Production: TURSO_DATABASE_URL (libsql://...) + TURSO_AUTH_TOKEN
 * - 本地/测试：回退到本地文件 file:./data/local.db
 *   Local/test: fall back to the local file file:./data/local.db
 * - Vercel 只读 FS：file: 库先复制到可写的 /tmp 再以只读方式打开（仅支持读场景）。
 *   Vercel read-only FS: copy the bundled file DB into writable /tmp before opening.
 */
export function getDb(): Client {
  if (!client) {
    let url = process.env.TURSO_DATABASE_URL ?? 'file:./data/local.db';

    // Vercel 运行时文件系统只读（仅 /tmp 可写，且每次冷启动重置）：
    // 把随包部署的本地库复制到 /tmp 再打开，避免以写方式打开只读文件报错。
    if (url.startsWith('file:') && process.env.VERCEL) {
      const src = path.join(process.cwd(), 'data', 'local.db');
      const dst = '/tmp/local.db';
      if (fs.existsSync(src)) {
        if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
        url = 'file:/tmp/local.db';
      }
    }

    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

/** 测试/脚本中用于注入 mock 客户端或重置单例 / Inject a mock client or reset the singleton (tests/scripts). */
export function setDb(mock: Client | null): void {
  client = mock;
}
