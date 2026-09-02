// 单元测试：JSON-LD 安全序列化（防 </script> 提前闭合标签导致 XSS）。
// Unit test: JSON-LD safe serialization (prevents </script> breaking out of the tag).
import {describe, it, expect} from "vitest";
import {safeJsonLd} from "@/lib/json-ld";

describe("safeJsonLd", () => {
  it("转义 </script>，避免提前闭合 script 标签", () => {
    const out = safeJsonLd({name: "</script>"});
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script\\u003e");
  });

  it("转义注入型 payload 中的尖括号与 &", () => {
    const out = safeJsonLd({
      desc: '</script><img src=x onerror="alert(1)">',
    });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(out).not.toContain("onerror=\"alert(1)\"");
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
  });

  it("转义后仍是合法 JSON，可原样解析回原对象", () => {
    const data = {a: "<b>&'\"\\", n: 1, nested: {x: "<y>"}};
    const out = safeJsonLd(data);
    expect(JSON.parse(out)).toEqual(data);
  });

  it("普通内容不被额外改动", () => {
    const out = safeJsonLd({name: "智能风控系统"});
    expect(out).toBe('{"name":"智能风控系统"}');
  });

  it("不破坏 JSON 结构字符（{ } [ ] \" , :）", () => {
    const out = safeJsonLd({list: [1, 2], obj: {k: "v"}});
    expect(JSON.parse(out)).toEqual({list: [1, 2], obj: {k: "v"}});
  });
});
