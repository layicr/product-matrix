import {createClient} from '@libsql/client';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// 数据库连接：优先使用 Turso 云地址，否则回退本地文件数据库。
// DB connection: prefer the Turso cloud URL, otherwise fall back to the local file database.
const url = process.env.TURSO_DATABASE_URL ?? 'file:./data/local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({url, authToken});

// 表结构（DDL）与表数据（DML）统一维护在 data/ 下的 SQL 文件。
// Table schema (DDL) and seed data (DML) are maintained as SQL files under data/.
const schemaSql = readFileSync(resolve(process.cwd(), 'data', 'schema.sql'), 'utf8');
const dataSql = readFileSync(resolve(process.cwd(), 'data', 'products-data.sql'), 'utf8');
const teamDataSql = readFileSync(resolve(process.cwd(), 'data', 'team-data.sql'), 'utf8');
const partnersDataSql = readFileSync(resolve(process.cwd(), 'data', 'partners-data.sql'), 'utf8');

// 先将整文件按行剔除 -- 注释行，再按分号拆分为多条语句。
// 顺序很关键：先去掉注释，避免在注释/字符串内的分号（如 "schema.sql; features"）处误拆。
// First strip `--` comment lines from the whole file, THEN split by semicolons —
// this avoids splitting on a `;` that lives inside a comment (e.g. "schema.sql; features").
function toStatements(sql: string): string[] {
  const withoutComments = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return withoutComments
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function runSql(sql: string): Promise<void> {
  for (const stmt of toStatements(sql)) {
    await db.execute(stmt);
  }
}

async function main() {
  await runSql(schemaSql);
  await runSql(dataSql);
  await runSql(teamDataSql);
  await runSql(partnersDataSql);

  console.log(`Seeded products, team and partners into ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
