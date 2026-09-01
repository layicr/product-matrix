// 简要管理端：通用 CRUD REST API + 静态页面托管。
// 数据表结构通过 PRAGMA 自省，无需针对每张表硬编码字段。
import { createClient } from '@libsql/client';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const dbPath = join(root, 'data', 'local.db');
const publicDir = join(root, 'public');

const client = createClient({ url: `file:${dbPath}` });

const TABLES = ['products', 'team', 'partners'];
// 缓存每张表的列信息（启动时加载一次）。
const metaCache = {};
for (const t of TABLES) {
  const r = await client.execute(`PRAGMA table_info(${t})`);
  metaCache[t] = r.rows.map((c) => ({
    name: c.name,
    type: c.type,
    pk: !!c.pk,
    notnull: !!c.notnull,
  }));
}

const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });

// 仅保留属于该表的字段，防止注入；返回 {cols, values, placeholders}
function buildCols(table, body) {
  const cols = metaCache[table].map((c) => c.name);
  const keys = Object.keys(body).filter((k) => cols.includes(k));
  return keys;
}

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', table, id?]
  const table = parts[1];
  const id = parts[2];

  if (!TABLES.includes(table)) return send(res, 404, { error: '未知表' });

  // 列出某张表的列信息
  if (parts.length === 2 && req.method === 'GET' && table === parts[1] && url.searchParams.get('meta') === '1') {
    return send(res, 200, { columns: metaCache[table] });
  }

  try {
    if (req.method === 'GET' && !id) {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const pageSize = Math.min(
        200,
        Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10) || 20)
      );
      const offset = (page - 1) * pageSize;
      const totalRes = await client.execute(`SELECT COUNT(*) AS c FROM ${table}`);
      const total = Number(totalRes.rows[0].c);
      const r = await client.execute(
        `SELECT * FROM ${table} ORDER BY id LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );
      return send(res, 200, { rows: r.rows, total, page, pageSize });
    }

    if (req.method === 'GET' && id) {
      const r = await client.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (r.rows.length === 0) return send(res, 404, { error: '未找到' });
      return send(res, 200, { row: r.rows[0] });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      // 校验必填（NOT NULL 且非主键）字段是否齐全
      const required = metaCache[table]
        .filter((c) => c.notnull && !c.pk)
        .map((c) => c.name);
      const missing = required.filter((name) => !(name in body));
      if (missing.length > 0) {
        return send(res, 400, { error: `缺少必填字段: ${missing.join(', ')}` });
      }
      const cols = buildCols(table, body);
      if (cols.length === 0) return send(res, 400, { error: '无有效字段' });
      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map((c) => body[c]);
      const r = await client.execute(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      );
      return send(res, 201, { changes: r });
    }

    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      const cols = buildCols(table, body).filter((c) => c !== 'id');
      if (cols.length === 0) return send(res, 400, { error: '无有效字段' });
      const setClause = cols.map((c) => `${c} = ?`).join(', ');
      const values = [...cols.map((c) => body[c]), id];
      const r = await client.execute(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`,
        values
      );
      return send(res, 200, { changes: r });
    }

    if (req.method === 'DELETE' && id) {
      const r = await client.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return send(res, 200, { changes: r });
    }

    return send(res, 405, { error: '方法不允许' });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);

  if (url.pathname === '/' || url.pathname === '') {
    try {
      const html = await readFile(join(publicDir, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      return res.end(html);
    } catch {
      res.writeHead(404);
      return res.end('index.html 缺失');
    }
  }

  // 静态资源
  const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
  try {
    const filePath = join(publicDir, safePath);
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    return res.end(data);
  } catch {
    res.writeHead(404);
    return res.end('not found');
  }
});

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`管理端已启动: http://localhost:${PORT}`);
});
