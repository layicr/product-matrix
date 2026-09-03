import type {Page} from "@playwright/test";

// 首页弹窗（isPopup 产品）在加载时自动弹出全屏遮罩，会拦截其它首页交互测试的点击，
// 且弹出时机受 React effect + Turbopack 冷编译影响不确定，导致用例偶发失败。
// The auto popup (isPopup product) renders a full-screen overlay on load which
// intercepts pointer events; its timing is nondeterministic under Turbopack,
// so home-page interaction tests pre-seed its cooldown record to keep it hidden.
export async function blockPopup(page: Page) {
  await page.addInitScript(() => {
    // 当前数据集中 isPopup 产品为 p001（lyc.la主页）；写入 3 小时冷却记录使其不弹。
    // Seed the 3h cooldown record for the isPopup product (p001) so it stays hidden.
    localStorage.setItem(
      "popup_last_shown",
      JSON.stringify({id: "p001", time: Date.now()}),
    );
  });
}
