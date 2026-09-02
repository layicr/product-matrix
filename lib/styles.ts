/**
 * 复用的样式片段，集中手绘按钮的公共部分，避免 className 在多处重复。
 * Reusable style fragment for hand-drawn buttons, sharing common classes to avoid duplication.
 *
 * 注意：navbar / filter-bar 的边框或旋转方向与这里不同，未统一纳入。
 * Note: navbar / filter-bar use different borders or rotation, so they are not included here.
 */
export const handButtonBase =
  "border-[2.5px] border-ink shadow-hand-btn transition-all hover:rotate-0 hover:-translate-x-0.5 hover:-translate-y-0.5";
