"use client";

import {useTranslations} from "next-intl";
import {FILTER_KEYS, type FilterKey} from "@/lib/filters";

// 筛选栏：按产品状态切换（全部 / 已上线 / 即将上线 / 规划中）。
// Filter bar: switch product status (all / live / soon / planned).

interface FilterBarProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  count: number;
}

export default function FilterBar({activeFilter, onFilterChange, count}: FilterBarProps) {
  const t = useTranslations();

  // 筛选项由 lib/filters 的 FILTER_KEYS 派生，避免顺序/取值两处维护。
  // Filters derive from FILTER_KEYS in lib/filters so order & values live in one place.
  const filters = FILTER_KEYS.map((key: FilterKey) => ({
    key,
    label: t(`filter.${key}`),
  }));

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-5">
      <span className="font-hand text-lg mr-1">{t("filter.label")}</span>
      {filters.map((filter, i) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`font-script text-base md:text-lg px-4 md:px-5 py-1.5 border-[2.5px] border-ink transition-all ${
            i % 2 === 0 ? "-rotate-0.5" : "rotate-0.5"
          } ${
            activeFilter === filter.key
              ? "bg-ink text-paper -rotate-1 shadow-hand-btn"
              : "bg-transparent hover:bg-sticky-yellow hover:rotate-0 hover:scale-105"
          }`}
        >
          {filter.label}
        </button>
      ))}
      <span className="font-caveat text-lg text-ink-light ml-2">
        {/* 使用 next-intl 原生插值 / Uses next-intl native interpolation. */}
        {t("filter.count", {count})}
      </span>
    </div>
  );
}
