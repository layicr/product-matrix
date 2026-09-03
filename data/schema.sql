-- products 表结构（单一真源，供 scripts/seed.ts 建表使用）。
-- products table schema (single source of truth, used by scripts/seed.ts to create the table).
-- 字段与 lib/types.ts 的 Product 类型一一对应：
-- Columns map 1:1 to the Product type in lib/types.ts:
--   name_zh/name_en        <- name.{zh,en}
--   category_zh/category_en <- category.{zh,en}
--   desc_zh/desc_en        <- desc.{zh,en}
--   features_zh/features_en <- JSON 字符串化的 features.{zh,en}
-- 产品矩阵主表：存放全部产品的静态信息，由 scripts/seed.ts 读取 schema.sql + products-data.sql 写入。
-- Product master table: holds all product data, written by scripts/seed.ts from schema.sql + products-data.sql.
CREATE TABLE IF NOT EXISTS products (
  -- 产品唯一标识，如 p0001（对应 Product.id，作为主键）
  id          TEXT PRIMARY KEY,
  -- 产品编号，如 01，用于卡片水印展示
  num         TEXT NOT NULL,
  -- 产品名称（中文）
  name_zh     TEXT NOT NULL,
  -- 产品名称（英文）
  name_en     TEXT NOT NULL,
  -- 产品分类（中文）
  category_zh TEXT NOT NULL,
  -- 产品分类（英文）
  category_en TEXT NOT NULL,
  -- 便签配色键名，对应 lib/colors 的 colorMap
  color       TEXT NOT NULL,
  -- 产品状态：live（已上线）/ soon（即将上线）/ planned（规划中）/ archived（已归档）
  status      TEXT NOT NULL,
  -- 上线时间，如 2024-Q1
  launch      TEXT NOT NULL,
  -- 预约演示外链
  demo_url    TEXT NOT NULL,
  -- 产品描述（中文）
  desc_zh     TEXT NOT NULL,
  -- 产品描述（英文）
  desc_en     TEXT NOT NULL,
  -- 特性列表（中文），以 JSON 字符串存储，对应 Product.features.zh
  features_zh TEXT NOT NULL,
  -- 特性列表（英文），以 JSON 字符串存储，对应 Product.features.en
  features_en TEXT NOT NULL,
  -- 是否新上线（1=是），用于卡片 NEW 角标 / Newly launched flag.
  is_new      INTEGER NOT NULL DEFAULT 0,
  -- 是否关注（1=是），用于卡片小火图标 / Watched/followed flag.
  is_watched  INTEGER NOT NULL DEFAULT 0,
  -- 是否为首页弹框产品（1=是），页面打开时播放飞入→爆炸→消息卡片动画，文案取产品描述。
  -- Homepage popup flag (1=yes): on page load, play fly-in → burst → message card animation; text uses product description.
  is_popup    INTEGER NOT NULL DEFAULT 0
);

-- 核心团队表：存放团队成员静态信息，由 scripts/seed.ts 读取 schema.sql + team-data.sql 写入。
-- Core team table: holds member data, written by scripts/seed.ts from schema.sql + team-data.sql.
CREATE TABLE IF NOT EXISTS team (
  -- 成员唯一标识，如 t01（作为主键）
  id        TEXT PRIMARY KEY,
  -- 展示排序（升序）
  ord       INTEGER NOT NULL,
  -- 姓名（中文）
  name_zh   TEXT NOT NULL,
  -- 姓名（英文）
  name_en   TEXT NOT NULL,
  -- 职位（中文）
  role_zh   TEXT NOT NULL,
  -- 职位（英文）
  role_en   TEXT NOT NULL,
  -- 头像文字（中文，如“张”）
  avatar_zh TEXT NOT NULL,
  -- 头像文字（英文，如“Z”）
  avatar_en TEXT NOT NULL,
  -- 头像配色类名（对应 tailwind 背景色）
  bg        TEXT NOT NULL
);

-- 合作伙伴表：存放合作伙伴静态信息，由 scripts/seed.ts 读取 schema.sql + partners-data.sql 写入。
-- Partners table: holds partner data, written by scripts/seed.ts from schema.sql + partners-data.sql.
CREATE TABLE IF NOT EXISTS partners (
  -- 合作伙伴唯一标识，如 p01（作为主键）
  id      TEXT PRIMARY KEY,
  -- 展示排序（升序）
  ord     INTEGER NOT NULL,
  -- 合作伙伴名称（中文）
  name_zh TEXT NOT NULL,
  -- 合作伙伴名称（英文）
  name_en TEXT NOT NULL,
  -- Logo 图片地址（可选）
  logo    TEXT,
  -- 跳转链接（可选）
  url     TEXT
);
