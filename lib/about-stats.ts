// About 页统计项构建（纯函数，便于单测）。
// About page stat builder (pure function, easy to unit test).

export interface AboutStat {
  num: string;
  labelKey: string;
}

/**
 * 构建 About 页统计项。
 * Build the About page stat entries.
 *
 * 合作伙伴为 0 时隐藏「合作伙伴」一项，避免出现「0+ 合作伙伴」这种无意义展示，
 * 与下方合作伙伴列表块的显示条件保持一致。
 * When there are no partners, the "partners" stat is hidden so we never show a
 * meaningless "0+ partners" — kept in sync with the conditional partners list below.
 */
export function buildAboutStats(
  productCount: number,
  partnerCount: number,
): AboutStat[] {
  const stats: AboutStat[] = [{num: `${productCount}+`, labelKey: "about.stat1"}];

  if (partnerCount > 0) {
    stats.push({num: `${partnerCount}+`, labelKey: "about.stat2"});
  }

  return stats;
}
