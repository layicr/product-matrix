// 集成测试用例：拉起管理端服务，对三张表的增删改查、分页、参数校验与注入防护进行验证。
// 运行：npm test   （使用 Node 内置 node:test，无需额外依赖）
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const B = (p) => `${BASE}/api${p}`;

// 每次运行的唯一前缀，避免与历史脏数据冲突；结束后统一清理。
const RUN = Date.now();
const pid = (s) => `T${RUN}_${s}`;
const SWEEP = /^T\d+_/;

let server;

function waitReady() {
  const t0 = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const r = await fetch(`${BASE}/api/products`);
        if (r.ok) return resolve();
      } catch {}
      if (Date.now() - t0 > 15000) return reject(new Error('服务启动超时'));
      setTimeout(tick, 200);
    };
    tick();
  });
}

// 调用封装：返回 { status, json }
const call = (m, p, b) =>
  fetch(B(p), {
    method: m,
    headers: { 'Content-Type': 'application/json' },
    body: b ? JSON.stringify(b) : null,
  });
const mk = async (m, p, b) => {
  const r = await call(m, p, b);
  return { status: r.status, json: await r.json().catch(() => ({})) };
};

const product = (id) => ({
  id, num: '1', name_zh: '测试', name_en: 'T', category_zh: 'c', category_en: 'c',
  color: 'blue', status: 'live', launch: '2024-Q1', demo_url: '',
  desc_zh: 'd', desc_en: 'd', features_zh: '[]', features_en: '[]',
  is_new: 0, is_watched: 0, is_popup: 0,
});

// 清理所有测试产生的数据
async function sweep() {
  for (const t of ['products', 'team', 'partners']) {
    const r = await mk('GET', `/${t}?pageSize=200`);
    for (const row of r.json.rows || []) {
      if (SWEEP.test(row.id)) await mk('DELETE', `/${t}/${row.id}`);
    }
  }
}

before(async () => {
  server = spawn('node', ['server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  await waitReady();
});

after(async () => {
  await sweep();
  if (server) server.kill();
});

// ---------- meta ----------
test('meta 返回列元信息，且 id 为主键', async () => {
  const m = await mk('GET', '/products?meta=1');
  assert.equal(m.status, 200);
  assert.ok(Array.isArray(m.json.columns) && m.json.columns.length > 0);
  const idCol = m.json.columns.find((c) => c.name === 'id');
  assert.ok(idCol && idCol.pk === true);
});

// ---------- products 增删改查 ----------
test('products 完整 CRUD', async () => {
  const id = pid('p1');
  let r = await mk('POST', '/products', product(id));
  assert.equal(r.status, 201);

  r = await mk('GET', `/products/${id}`);
  assert.equal(r.status, 200);
  assert.equal(r.json.row.name_zh, '测试');

  r = await mk('PUT', `/products/${id}`, { name_zh: '测试2', status: 'soon' });
  assert.equal(r.status, 200);

  r = await mk('GET', `/products/${id}`);
  assert.equal(r.json.row.name_zh, '测试2');
  assert.equal(r.json.row.status, 'soon');

  r = await mk('DELETE', `/products/${id}`);
  assert.equal(r.status, 200);

  r = await mk('GET', `/products/${id}`);
  assert.equal(r.status, 404);
});

test('products.is_popup 可标记首页弹框产品并回读', async () => {
  const id = pid('pp1');
  await mk('POST', '/products', { ...product(id), is_popup: 1 });
  let g = await mk('GET', `/products/${id}`);
  assert.equal(g.json.row.is_popup, 1);

  // 关闭弹框标记
  await mk('PUT', `/products/${id}`, { is_popup: 0 });
  g = await mk('GET', `/products/${id}`);
  assert.equal(g.json.row.is_popup, 0);
  await mk('DELETE', `/products/${id}`);
});

// ---------- 分页 ----------
test('分页：每页条数与总条数正确', async () => {
  const n = 25;
  // 以当前已有记录数为基准，避免与库中既有数据（如种子数据）冲突
  const baseline = (await mk('GET', '/products?pageSize=200')).json.total;
  for (let i = 1; i <= n; i++) {
    await mk('POST', '/products', product(pid('pg' + String(i).padStart(2, '0'))));
  }
  const p1 = await mk('GET', '/products?page=1&pageSize=20');
  assert.equal(p1.json.total, baseline + n);
  assert.equal(p1.json.rows.length, 20);
  assert.equal(p1.json.page, 1);

  const p2 = await mk('GET', '/products?page=2&pageSize=20');
  assert.equal(p2.json.rows.length, baseline + n - 20);

  const p3 = await mk('GET', '/products?page=1&pageSize=10');
  assert.equal(p3.json.rows.length, 10);

  // 清理本用例数据
  for (let i = 1; i <= n; i++) {
    await mk('DELETE', `/products/${pid('pg' + String(i).padStart(2, '0'))}`);
  }
  const after = await mk('GET', '/products?pageSize=200');
  assert.equal(after.json.total, baseline);
});

// ---------- 参数校验 ----------
test('缺少 id 的 POST 返回 400', async () => {
  const r = await mk('POST', '/products', { name_zh: 'x' });
  assert.equal(r.status, 400);
});

test('未知数据表返回 404', async () => {
  const r = await mk('GET', '/notable');
  assert.equal(r.status, 404);
});

test('更新时忽略未知列（防注入/白名单）', async () => {
  const id = pid('p2');
  await mk('POST', '/products', product(id));
  const r = await mk('PUT', `/products/${id}`, { name_zh: 'y', bogus_col: 'z' });
  assert.equal(r.status, 200);
  const g = await mk('GET', `/products/${id}`);
  assert.equal(g.json.row.name_zh, 'y');
  await mk('DELETE', `/products/${id}`);
});

test('id 含特殊字符时查询安全（参数化）', async () => {
  // 不存在的 id（含引号）应返回 404，而非报错或注入
  const r = await mk('GET', '/products/' + encodeURIComponent("x' OR '1'='1"));
  assert.equal(r.status, 404);
});

// ---------- team / partners ----------
test('team 完整 CRUD（含头像配色 bg-sticky- 约定）', async () => {
  const id = pid('t1');
  await mk('POST', '/team', {
    id, ord: 1, name_zh: '张', name_en: 'Z', role_zh: '工程', role_en: 'Eng',
    avatar_zh: '张', avatar_en: 'Z', bg: 'bg-sticky-blue',
  });
  const g = await mk('GET', `/team/${id}`);
  assert.equal(g.json.row.name_zh, '张');
  // 头像配色按约定以 bg-sticky- 前缀存储，且可原样回读
  assert.equal(g.json.row.bg, 'bg-sticky-blue');
  await mk('DELETE', `/team/${id}`);
});

test('team 头像配色支持全部 COLOR_OPTIONS 取值', async () => {
  const colors = ['blue', 'sky', 'cyan', 'teal', 'emerald', 'green', 'lime',
    'yellow', 'amber', 'orange', 'red', 'rose', 'pink', 'fuchsia',
    'purple', 'violet', 'indigo'];
  for (const c of colors) {
    const id = pid('c_' + c);
    await mk('POST', '/team', {
      id, ord: 1, name_zh: 'x', name_en: 'x', role_zh: 'x', role_en: 'x',
      avatar_zh: 'x', avatar_en: 'x', bg: `bg-sticky-${c}`,
    });
    const g = await mk('GET', `/team/${id}`);
    assert.equal(g.json.row.bg, `bg-sticky-${c}`);
    await mk('DELETE', `/team/${id}`);
  }
});

test('partners 可空字段允许为空', async () => {
  const id = pid('pa1');
  await mk('POST', '/partners', { id, ord: 1, name_zh: '伙伴', name_en: 'P' });
  const g = await mk('GET', `/partners/${id}`);
  assert.equal(g.json.row.name_zh, '伙伴');
  assert.equal(g.json.row.logo, null);
  await mk('DELETE', `/partners/${id}`);
});
