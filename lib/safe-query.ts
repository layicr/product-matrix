// 数据读取兜底：DB 不可达 / 超时 / 数据损坏时不让整页 500，降级为安全默认值。
// Data-read fallback: never 500 the whole page on DB outage / timeout / corrupt data;
// degrade to a safe default instead.
//
// 只用于「读多写死」的展示型查询。写操作不应吞异常。
// Only for read-only display queries. Writes must not swallow errors.
export async function safeQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // 保留服务端日志，便于排障；页面继续渲染降级内容。
    // Keep a server-side log for triage; the page still renders degraded content.
    console.error(`[db] ${label} failed, falling back to default:`, err);
    return fallback;
  }
}
