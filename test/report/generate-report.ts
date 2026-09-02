import {readFileSync, writeFileSync, existsSync, mkdirSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = __dirname;
const DATE = "2026-09-01";

type Counts = {total: number; passed: number; failed: number; skipped: number};

function emptyCounts(): Counts {
  return {total: 0, passed: 0, failed: 0, skipped: 0};
}

function mergeCounts(a: Counts, b: Counts): Counts {
  return {
    total: a.total + b.total,
    passed: a.passed + b.passed,
    failed: a.failed + b.failed,
    skipped: a.skipped + b.skipped,
  };
}

/** 解析 Vitest JSON（兼容 v3/v4 的 files / testResults 两种结构）/ Parse Vitest JSON (handles both v3/v4 `files` and `testResults` shapes). */
function parseVitest(file: string): {counts: Counts; files: {name: string; status: string; tests: number; passed: number}[]} {
  const counts = emptyCounts();
  const files: {name: string; status: string; tests: number; passed: number}[] = [];

  if (!existsSync(file)) return {counts, files};

  const data = JSON.parse(readFileSync(file, "utf-8"));
  const suites = data.files ?? data.testResults ?? [];
  for (const f of suites) {
    const tests = f.tests ?? f.assertionResults ?? [];
    let tPass = 0;
    for (const t of tests) {
      counts.total += 1;
      if (t.status === "passed") {
        counts.passed += 1;
        tPass += 1;
      } else if (t.status === "failed") {
        counts.failed += 1;
      } else if (t.status === "skipped" || t.status === "pending") {
        counts.skipped += 1;
      }
    }
    files.push({
      name: (f.name ?? f.file ?? "unknown").replace(/.*test\//, "test/"),
      status: counts.failed === 0 ? "passed" : "failed",
      tests: tests.length,
      passed: tPass,
    });
  }
  return {counts, files};
}

/** 解析 Playwright JSON / Parse Playwright JSON. */
function parsePlaywright(file: string): {counts: Counts; specs: {name: string; status: string}[]} {
  const counts = emptyCounts();
  const specs: {name: string; status: string}[] = [];
  if (!existsSync(file)) return {counts, specs};

  const data = JSON.parse(readFileSync(file, "utf-8"));
  if (data.stats) {
    // Playwright stats: expected / unexpected / skipped / flaky（无 total/passed/failed 字段）
    const {expected = 0, unexpected = 0, skipped = 0, flaky = 0} = data.stats;
    counts.total = expected + unexpected + skipped + flaky;
    counts.passed = expected + flaky;
    counts.failed = unexpected;
    counts.skipped = skipped;
  }

  const walk = (suites: any[]) => {
    for (const s of suites ?? []) {
      if (s.specs) {
        for (const spec of s.specs) {
          const ok = (spec.tests ?? []).every((t: any) => (t.results ?? []).every((r: any) => r.status === "passed"));
          const failed = (spec.tests ?? []).some((t: any) => (t.results ?? []).some((r: any) => r.status === "failed"));
          specs.push({name: spec.title, status: failed ? "failed" : ok ? "passed" : "skipped"});
        }
      }
      if (s.suites) walk(s.suites);
    }
  };
  walk(data.suites ?? []);
  return {counts, specs};
}

function main() {
  const vitestFile = join(REPORT_DIR, "vitest.json");
  const pwFile = join(REPORT_DIR, "playwright-results.json");

  const vitest = parseVitest(vitestFile);
  const pw = parsePlaywright(pwFile);

  const total = mergeCounts(vitest.counts, pw.counts);
  const passRate = total.total ? ((total.passed / total.total) * 100).toFixed(1) : "0.0";

  const allPass = total.failed === 0;

  const md = [
    `# 产品矩阵展示站 · 测试报告`,
    ``,
    `**日期：${DATE}**  `,
    `**结论：${allPass ? "✅ 全部通过" : "⚠️ 存在失败用例"}**  `,
    `**总计：${total.total} 用例 / 通过 ${total.passed} / 失败 ${total.failed} / 跳过 ${total.skipped}（通过率 ${passRate}%）**`,
    ``,
    `## 概览`,
    ``,
    `| 类别 | 总用例 | 通过 | 失败 | 跳过 |`,
    `| --- | --- | --- | --- | --- |`,
    `| 单元测试 (Vitest) | ${vitest.counts.total} | ${vitest.counts.passed} | ${vitest.counts.failed} | ${vitest.counts.skipped} |`,
    `| E2E (Playwright: UI/UE/安全) | ${pw.counts.total} | ${pw.counts.passed} | ${pw.counts.failed} | ${pw.counts.skipped} |`,
    `| **合计** | **${total.total}** | **${total.passed}** | **${total.failed}** | **${total.skipped}** |`,
    ``,
    `## 单元测试明细`,
    ``,
    `| 文件 | 用例数 | 通过 | 状态 |`,
    `| --- | --- | --- | --- |`,
    ...vitest.files.map((f) => `| \`${f.name}\` | ${f.tests} | ${f.passed} | ${f.status === "passed" ? "✅" : "❌"} |`),
    ``,
    `## E2E 测试明细`,
    ``,
    pw.specs.length
      ? `| 用例 | 状态 |\n| --- | --- |\n${pw.specs.map((s) => `| ${s.name} | ${s.status === "passed" ? "✅" : s.status === "failed" ? "❌" : "⏭️"} |`).join("\n")}`
      : `_（Playwright 结果文件缺失，可能未执行或环境未安装浏览器）_`,
    ``,
    `## 覆盖范围`,
    ``,
    `- **单元测试**：i18n 本地化纯函数、libSQL 数据层（mock 客户端）、messages 键完整性、核心组件（Hero/FilterBar/SearchBar/ProductCard/LanguageSwitcher）渲染与交互。`,
    `- **UI 测试**：中/英文首页加载、语言切换改 URL、卡片点击弹窗、搜索与筛选、关于页导航、详情页按语言渲染、非法 id 404。`,
    `- **UE 测试**：全部路由 axe-core 结构性可访问性审计、移动(375)/桌面(1280)响应式布局、键盘可达性。`,
    `- **安全测试**：安全响应头（X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy）、搜索框 XSS 注入转义、非法 lang 与越权 id 兜底、开放重定向防护。`,
    ``,
    `---`,
    `*由测试聚合脚本自动生成于 ${DATE}。*`,
    ``,
  ].join("\n");

  const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>测试报告 ${DATE}</title>
<style>body{font-family:system-ui,'Segoe UI',sans-serif;max-width:960px;margin:40px auto;padding:0 20px;color:#222}
h1{font-size:24px}h2{margin-top:32px;border-left:4px solid #2C2C2C;padding-left:10px}
table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
th{background:#f5f5f5}.ok{color:#15803d}.bad{color:#b91c1c}.muted{color:#888}code{background:#f2f2f2;padding:1px 5px;border-radius:3px}</style></head>
<body>
<h1>产品矩阵展示站 · 测试报告</h1>
<p><strong>日期：${DATE}</strong> · <strong>结论：${allPass ? "✅ 全部通过" : "⚠️ 存在失败用例"}</strong></p>
<p>总计 <strong>${total.total}</strong> 用例 / 通过 <strong>${total.passed}</strong> / 失败 <strong>${total.failed}</strong> / 跳过 <strong>${total.skipped}</strong>（通过率 ${passRate}%）</p>
<h2>概览</h2>
<table><tr><th>类别</th><th>总用例</th><th>通过</th><th>失败</th><th>跳过</th></tr>
<tr><td>单元测试 (Vitest)</td><td>${vitest.counts.total}</td><td>${vitest.counts.passed}</td><td>${vitest.counts.failed}</td><td>${vitest.counts.skipped}</td></tr>
<tr><td>E2E (Playwright)</td><td>${pw.counts.total}</td><td>${pw.counts.passed}</td><td>${pw.counts.failed}</td><td>${pw.counts.skipped}</td></tr>
<tr><td><strong>合计</strong></td><td><strong>${total.total}</strong></td><td><strong>${total.passed}</strong></td><td><strong>${total.failed}</strong></td><td><strong>${total.skipped}</strong></td></tr>
</table>
<h2>单元测试明细</h2>
<table><tr><th>文件</th><th>用例数</th><th>通过</th><th>状态</th></tr>
${vitest.files.map((f) => `<tr><td><code>${f.name}</code></td><td>${f.tests}</td><td>${f.passed}</td><td class="${f.status === "passed" ? "ok" : "bad"}">${f.status === "passed" ? "✅" : "❌"}</td></tr>`).join("\n")}
</table>
<h2>E2E 测试明细</h2>
${pw.specs.length ? `<table><tr><th>用例</th><th>状态</th></tr>${pw.specs.map((s) => `<tr><td>${s.name}</td><td class="${s.status === "passed" ? "ok" : s.status === "failed" ? "bad" : "muted"}">${s.status === "passed" ? "✅" : s.status === "failed" ? "❌" : "⏭️"}</td></tr>`).join("\n")}</table>` : `<p class="muted">（Playwright 结果文件缺失，可能未执行或环境未安装浏览器）</p>`}
<h2>覆盖范围</h2>
<ul>
<li><strong>单元测试</strong>：i18n 本地化纯函数、libSQL 数据层（mock 客户端）、messages 键完整性、核心组件渲染与交互。</li>
<li><strong>UI 测试</strong>：中/英文首页、语言切换、卡片弹窗、搜索筛选、关于页导航、详情页按语言渲染、非法 id 404。</li>
<li><strong>UE 测试</strong>：axe-core 可访问性审计、移动/桌面响应式、键盘可达性。</li>
<li><strong>安全测试</strong>：安全响应头、XSS 注入转义、非法 lang/越权 id 兜底、开放重定向防护。</li>
</ul>
<p class="muted">由测试聚合脚本自动生成于 ${DATE}。</p>
</body></html>`;

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, {recursive: true});
  writeFileSync(join(REPORT_DIR, `${DATE}.md`), md, "utf-8");
  writeFileSync(join(REPORT_DIR, `${DATE}.html`), html, "utf-8");
  console.log(`测试报告已生成：test/report/${DATE}.md 与 test/report/${DATE}.html`);
  console.log(`总计 ${total.total} / 通过 ${total.passed} / 失败 ${total.failed}`);
}

main();
