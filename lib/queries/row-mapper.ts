// 数据库行映射工具：将 _zh/_en 列重新组合为 { zh, en } 结构。
// DB row mapper: re-group _zh/_en columns into { zh, en } objects.
//
// products / team / partners 三个查询模块都有相同的映射模式，抽成共享工具避免重复。
// The products/team/partners query modules share this mapping pattern; extracted to avoid duplication.

/** 从行中提取 { zh, en } 文本对 / Extract a { zh, en } text pair from a row. */
export function localizedField(row: Record<string, unknown>, prefix: string): {zh: string; en: string} {
  return {
    zh: String(row[`${prefix}_zh`]),
    en: String(row[`${prefix}_en`]),
  };
}

/** 从行中提取可为空的字段 / Extract a nullable field from a row. */
export function nullableField(row: Record<string, unknown>, key: string): string | null {
  return row[key] == null ? null : String(row[key]);
}
