"use client";

import {Search, X} from "lucide-react";
import {useTranslations} from "next-intl";

// 搜索框：受控输入，向父组件回传查询词。
// Search bar: controlled input that reports the query to the parent.
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({value, onChange}: SearchBarProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-center px-6 md:px-10 pt-6 pb-2">
      <div className="relative w-full max-w-xl -rotate-0.5 hover:rotate-0 transition-transform">
        <div className="absolute inset-0 bg-ink translate-x-1 translate-y-1 -z-10" />
        <div className="flex items-center bg-paper border-[2.5px] border-ink px-4 py-2.5">
          <Search className="w-5 h-5 text-ink-light mr-3 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 min-w-0 bg-transparent font-hand text-lg text-ink placeholder:text-ink-light/50 outline-none"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="ml-2 p-1 hover:bg-sticky-yellow rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-ink-light" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
