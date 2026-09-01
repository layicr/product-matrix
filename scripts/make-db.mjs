// 依据 data/schema.sql 生成 data/local.db。
// 若 local.db 已存在则跳过，不覆盖。
import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dbPath = join(root, 'data', 'local.db');
const schemaPath = join(root, 'data', 'schema.sql');

if (existsSync(dbPath)) {
  console.log('local.db 已存在，跳过生成。');
  process.exit(0);
}

const schema = readFileSync(schemaPath, 'utf8');
const client = createClient({ url: `file:${dbPath}` });

// 逐条执行建表语句（以分号分隔），并剔除行内 -- 注释。
const statements = schema
  .split(';')
  .map((s) =>
    s
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim()
  )
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  await client.execute(stmt);
}

console.log(`已生成 ${dbPath}，共创建 ${statements.length} 张表。`);

// 读取建好的表清单，便于确认。
const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
);
console.log('表：', tables.rows.map((r) => r.name).join(', '));

await client.close();
