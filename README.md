# 产品矩阵 · 管理端（product-matrix-admin）

一个基于本地 SQLite 的简要管理端，提供 `products` / `team` / `partners` 三张表的 **增、删、改、查** 界面。

## 目录结构

```
product-matrix-admin/
├── data/
│   ├── schema.sql      # 数据库表结构（单一真源）
│   └── local.db        # 由 schema.sql 生成的 SQLite 数据库
├── public/
│   └── index.html      # 管理端单页界面（原生 HTML/JS）
├── scripts/
│   └── make-db.mjs     # 按 schema.sql 生成 local.db（已存在则跳过）
├── server.mjs          # 通用 CRUD REST API + 静态页面托管
└── package.json
```

## 环境依赖

- Node.js ≥ 18
- `@libsql/client`（已在 `dependencies` 中声明并安装）

## 使用步骤

```bash
# 1. 生成数据库（首次或需要重建时执行；若 local.db 已存在会自动跳过）
npm run db:init

# 2. 启动管理端
npm run admin
# 浏览器打开 http://localhost:3010
```

## 数据表说明

| 表 | 说明 | 主要字段 |
|----|------|----------|
| `products` | 产品矩阵主表 | `id`(PK)、`num`、`name_zh/en`、`category_zh/en`、`color`、`status`、`launch`、`demo_url`、`desc_zh/en`、`features_zh/en`、`is_new`、`is_watched` |
| `team` | 核心团队 | `id`(PK)、`ord`、`name_zh/en`、`role_zh/en`、`avatar_zh/en`、`bg` |
| `partners` | 合作伙伴 | `id`(PK)、`ord`、`name_zh/en`、`logo`(可空)、`url`(可空) |

### 字段约定

- `id`：主键，新增时必填；编辑时不可修改。
- `status`（仅 products）：`live`(已上线) / `soon`(即将上线) / `planned`(规划中) / `archived`(已归档)。
- `is_new`、`is_watched`：开关值，`0`=否，`1`=是。
- `features_zh` / `features_en`：JSON 字符串，如 `["特性A","特性B"]`。
- `desc_zh` / `desc_en`、`features_*`：多行文本。
- `partners.logo`、`partners.url`：允许为空。
- `products.color`、`team.bg`（头像配色）：均为下拉选择，选项见 `index.html` 的 `COLOR_OPTIONS`（17 种 tailwind 配色）。选中后下拉框旁会显示对应色块预览。
  - `team.bg` 在数据库中的实际存储值为 `bg-sticky-<color>`（如 `bg-sticky-blue`）；管理端在**读取时自动去掉 `bg-sticky-` 前缀**、**保存时自动拼接回前缀**，界面始终显示纯净配色名（如 `blue`）。

## 管理端操作

1. 顶部页签切换三张表。
2. 右上角「+ 新增」添加记录；填写表单后保存。
3. 每行「编辑」修改记录（表单按字段类型自动生成：配色下拉+色块、状态下拉、勾选、多行文本等）。
4. 编辑已有记录点击「保存」时，会弹出**二次确认**后才写入。
5. 每行「删除」移除记录，需二次确认。
6. 弹窗打开后，点击外侧遮罩区域**不会**关闭（仅「取消」或「保存」可关闭），避免误触丢失填写内容。
7. 界面内「使用说明」面板可随时查看上述约定。

## REST API

所有接口前缀 `/api`，表名仅限 `products` / `team` / `partners`：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/:table` | 列出该表全部记录 |
| GET | `/api/:table?meta=1` | 返回该表的列元信息 |
| GET | `/api/:table/:id` | 查询单条记录 |
| POST | `/api/:table` | 新增（body 含 `id`） |
| PUT | `/api/:table/:id` | 更新（body 为需修改的字段） |
| DELETE | `/api/:table/:id` | 删除 |

> 字段名通过 `PRAGMA table_info` 自省校验，白名单过滤，避免 SQL 注入。

## 测试

集成测试会拉起真实服务（`server.mjs`，随机端口），对三张表的增删改查、分页、参数校验与注入防护进行端到端验证；运行结束后自动清理本次产生的测试数据。

```bash
npm test
```

测试用例位于 `test/test-api.mjs`，使用 Node 内置 `node:test`，无需额外依赖。覆盖要点：

- `meta` 接口返回列元信息，`id` 为主键。
- `products` 完整 CRUD、分页（每页条数 / 总条数）。
- 参数校验：缺 `id` 的 POST 返回 400、未知表返回 404。
- 白名单：更新时忽略未知列；含特殊字符的 `id` 查询安全返回 404（防注入）。
- `team` 完整 CRUD，头像配色 `bg` 按 `bg-sticky-<color>` 约定存储并正确回读。
- `partners` 可空字段（`logo` / `url`）允许为空。