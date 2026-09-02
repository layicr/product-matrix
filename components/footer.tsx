"use client";

import {useLocale} from "next-intl";
import {isLocale} from "@/i18n/routing";
import {siteConfig} from "@/lib/site-config";

// 页脚：版权信息与作者署名 / Footer: copyright and author attribution.
export default function Footer() {
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "zh";

  return (
    <footer className="px-6 md:px-10 py-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-center border-t-2 border-dashed border-black/15">
      <p className="font-caveat text-sm text-ink-light/60 mt-2">
        ©{siteConfig.author}
      </p>
    </footer>
  );
}
