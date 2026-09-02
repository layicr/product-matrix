// 筛选栏的单一真源：筛选项顺序与取值。
// Single source of truth for the filter bar: order and values.
//
// 顺序很关键 —— 首页左右滑动切分类、筛选按钮渲染都依赖它，
// 此前 FILTER_KEYS 与按钮列表两处各写一份，容易漂移。
// Order matters — the home page's swipe-to-cycle-filters and the rendered
// buttons both depend on it. Previously FILTER_KEYS and the button list were
// maintained separately and could drift.

export const FILTER_KEYS = [
  "all",
  "live",
  "soon",
  "planned",
  "archived",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

/** 除「全部」外，其余筛选项都对应一个产品状态 / Every key except "all" maps to a product status. */
export type StatusFilterKey = Exclude<FilterKey, "all">;

/** 默认筛选项 / Default filter. */
export const DEFAULT_FILTER: FilterKey = "all";
