"use client";

import {useState, useEffect, useRef} from "react";
import {AnimatePresence} from "framer-motion";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import SearchBar from "@/components/search-bar";
import FilterBar from "@/components/filter-bar";
import ProductGrid from "@/components/product-grid";
import ProductDialog from "@/components/product-dialog";
import Footer from "@/components/footer";
import FloatingActions from "@/components/floating-actions";
import PopupIntro from "@/components/popup-intro";
import {FILTER_KEYS, DEFAULT_FILTER, type FilterKey} from "@/lib/filters";
import {useSwipe} from "@/lib/hooks/use-swipe";
import {isActiveProduct, isLiveProduct} from "@/lib/status";
import {productMatchesQuery} from "@/lib/search";
import {useLocale} from "next-intl";
import {isLocale} from "@/i18n/routing";
import {siteConfig} from "@/lib/site-config";
import type {Product} from "@/lib/types";

// 首页客户端组件：接收服务端下发的 products，处理搜索 / 筛选 / 弹窗状态。
// Home client component: receives server-fetched products and handles search / filter / dialog state.
export default function HomeClient({products}: {products: Product[]}) {
  const [filter, setFilter] = useState<FilterKey>(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // 首页弹框产品：页面加载时自动检测 isPopup，播放飞入→爆炸→消息卡片动画。
  // 3 小时冷却：localStorage 记录上次弹出时间，冷却期内刷新不再弹。
  // Homepage popup: auto-detect isPopup on load; 3h cooldown via localStorage.
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const popupCheckedRef = useRef(false);
  const rawLocale = useLocale();

  useEffect(() => {
    // useRef 守卫：React 严格模式下 effect 双调用只执行一次检查。
    if (popupCheckedRef.current) return;
    popupCheckedRef.current = true;

    const candidate = products.find((p) => p.isPopup);
    if (!candidate) return;

    const COOLDOWN_MS = siteConfig.popupCooldownMs;
    const raw = localStorage.getItem("popup_last_shown");
    const now = Date.now();

    // 记录格式 { id, time }：同一产品且在冷却期内才跳过；产品 id 变化则立即弹。
    // Record shape { id, time }: skip only for the same product within cooldown; id change triggers immediately.
    let shouldShow = true;
    if (raw) {
      try {
        const record = JSON.parse(raw) as {id?: string; time?: number};
        if (record.id === candidate.id && now - Number(record.time) <= COOLDOWN_MS) {
          shouldShow = false;
        }
      } catch {
        // 旧格式或解析失败，默认弹出 / Fallback to show on legacy format or parse error.
      }
    }

    if (shouldShow) {
      setPopupProduct(candidate);
      localStorage.setItem("popup_last_shown", JSON.stringify({id: candidate.id, time: now}));
    }
  }, [products]);
  const locale = isLocale(rawLocale) ? rawLocale : "zh";

  // 核心产品统计：复用 lib/status 的单一真源，与服务端 SQL 统计保持一致。
  // Core product count: reuses the single source of truth in lib/status,
  // keeping it consistent with the server-side SQL count.
  const productCount = products.filter(isActiveProduct).length;

  // 已上线数量：此前 Hero 里写死为 3，产品状态变化后不会更新。
  // Live count: previously hardcoded to 3 in Hero, so it never followed status changes.
  const liveCount = products.filter(isLiveProduct).length;

  const filteredProducts = products.filter((p) => {
    // 状态筛选 / Status filter.
    const statusMatch = filter === "all" || p.status === filter;
    if (!statusMatch) return false;
    // 搜索筛选：复用纯函数 productMatchesQuery（中英文名称 / 描述 / 分类 / 特性）。
    // Search filter: delegates to the pure productMatchesQuery function.
    return productMatchesQuery(p, searchQuery, locale);
  });

  // 移动端手势：左右滑动切换筛选分类（仅触屏，桌面鼠标不触发）。
  // Mobile gesture: swipe left/right to cycle filters (touch only — desktop mice emit no touch events).
  const swipe = useSwipe({
    onSwipeLeft: () => {
      const i = FILTER_KEYS.indexOf(filter);
      if (i > -1 && i < FILTER_KEYS.length - 1) setFilter(FILTER_KEYS[i + 1]);
    },
    onSwipeRight: () => {
      const i = FILTER_KEYS.indexOf(filter);
      if (i > 0) setFilter(FILTER_KEYS[i - 1]);
    },
  });

  // 弹窗内左右滑动：切换到上一个 / 下一个产品。
  // Swipe inside the dialog to move to the previous / next product.
  const navigateProduct = (dir: 1 | -1) => {
    if (!selectedProduct) return;
    const i = filteredProducts.findIndex((p) => p.id === selectedProduct.id);
    const target = filteredProducts[i + dir];
    if (target) setSelectedProduct(target);
  };

  return (
    <main className="min-h-screen" {...swipe}>
      <Navbar />
      <Hero productCount={productCount} liveCount={liveCount} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        count={filteredProducts.length}
      />
      <ProductGrid
        products={filteredProducts}
        onProductClick={setSelectedProduct}
      />
      <Footer />
      <FloatingActions />

      <AnimatePresence>
        {selectedProduct && (
          <ProductDialog
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigate={navigateProduct}
          />
        )}
      </AnimatePresence>

      {/* 首页弹框动画：仅当存在 isPopup 产品时渲染 / Homepage popup intro: only render when an isPopup product exists. */}
      <AnimatePresence>
        {popupProduct && (
          <PopupIntro
            product={popupProduct}
            locale={locale}
            onClose={() => setPopupProduct(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
