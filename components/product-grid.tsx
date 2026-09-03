"use client";

import {AnimatePresence, motion} from "framer-motion";
import ProductCard from "@/components/product-card";
import {useLocale, useTranslations} from "next-intl";
import {getLocalizedProduct} from "@/lib/localize";
import type {Product} from "@/lib/types";
import {isLocale} from "@/i18n/routing";

// 产品网格：按分类分组渲染卡片，支持筛选动画与空状态。
// Product grid: renders cards grouped by category, with filter animations and empty state.
interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({products, onProductClick}: ProductGridProps) {
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "zh";
  const t = useTranslations();

  // 按分类分组，保持原始顺序 / Group by category, preserving original order.
  const categoryOrder: string[] = [];
  const groupedMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const localized = getLocalizedProduct(product, locale);
    const cat = localized.category;
    if (!groupedMap.has(cat)) {
      groupedMap.set(cat, []);
      categoryOrder.push(cat);
    }
    groupedMap.get(cat)!.push(product);
  });

  const groupedProducts = categoryOrder.map((category) => ({
    category,
    products: groupedMap.get(category)!,
  }));

  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 py-8 pb-16">
      {groupedProducts.map((group) => (
        <div key={group.category} className="mb-14 last:mb-0">
          <div className="mb-7">
            <h2 className="font-hand text-2xl md:text-3xl inline-block -rotate-1 relative">
              {group.category}
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 Q50 2 100 5 T198 4"
                  fill="none"
                  stroke="#EF5350"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </h2>
            <span className="font-caveat text-sm text-ink-light/60 ml-3">
              {group.products.length} items
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 md:gap-7"
          >
            <AnimatePresence mode="popLayout">
              {group.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.95}}
                  transition={{duration: 0.25, delay: index * 0.03}}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    onClick={() => onProductClick(product)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="font-hand text-2xl mb-2">{t("grid.emptyTitle")}</p>
          <p className="font-script text-ink-light">{t("grid.emptyDesc")}</p>
        </div>
      )}
    </section>
  );
}
