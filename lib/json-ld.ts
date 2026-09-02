// JSON-LD 序列化：转义 < > & 以阻止 </script> 提前闭合标签。
// JSON-LD serialization: escape < > & so a "</script>" in the data cannot break out of the tag.
//
// 风险场景：JSON-LD 里含产品名/描述等来自数据库的内容，一旦出现 "</script>"
// 就会提前结束 <script> 块，后续内容按 HTML 解析 → 存储型 XSS。
// Risk: JSON-LD embeds DB-sourced content (product name/desc). A "</script>" inside
// would close the <script> block early and the rest parses as HTML → stored XSS.
//
// < > & 在 JSON 中不是结构字符（结构字符只有 { } [ ] " , :），
// 因此整体替换不会破坏 JSON 合法性。
// < > & are not structural in JSON (only { } [ ] " , : are), so a blanket
// replace cannot corrupt the JSON.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
