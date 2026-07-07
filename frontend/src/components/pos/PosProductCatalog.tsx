"use client";

import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HubListPage } from "@/components/shared/hub-list-page";
import { decorativeIconClassName } from "@/lib/theme/color-helpers";
import { listToolbarFieldClassName, listToolbarSearchClassName } from "@/lib/theme/feedback";
import {
  posCatalogFilterBarClassName,
  posCategoryChipClassName,
  posCategoryScrollClassName,
  posEmptyProductsClassName,
  posLoadingSpinnerClassName,
  posPriceClassName,
  posProductTileCategoryClassName,
  posProductTileClassName,
  posProductTileFooterClassName,
  posProductTileNameClassName,
  posStickyFilterBarClassName,
} from "@/lib/theme/immersive";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

export function PosProductCatalog({
  productsError,
  productsErr,
  productsFetching,
  onRetry,
  productSearch,
  onProductSearchChange,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  loading,
  filteredProducts,
  totalProducts,
  onProductClick,
}: {
  productsError: boolean;
  productsErr: unknown;
  productsFetching: boolean;
  onRetry: () => void;
  productSearch: string;
  onProductSearchChange: (value: string) => void;
  categories: string[];
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  loading: boolean;
  filteredProducts: Product[];
  totalProducts: number;
  onProductClick: (product: Product) => void;
}) {
  const isFiltered =
    Boolean(productSearch.trim()) ||
    categoryFilter != null ||
    filteredProducts.length !== totalProducts;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <HubListPage.Error
        message={
          productsError ? getErrorMessage(productsErr, "Failed to load menu items") : undefined
        }
        onRetry={onRetry}
        loading={productsFetching}
      />
      <div className={posStickyFilterBarClassName()}>
        <div className={posCatalogFilterBarClassName()}>
        <div className="relative">
          <Search
            className={decorativeIconClassName(
              "absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 pointer-events-none",
            )}
            aria-hidden
          />
          <Input
            id="pos-product-search"
            type="search"
            value={productSearch}
            onChange={(e) => onProductSearchChange(e.target.value)}
            placeholder="Search menu…  ( / )"
            className={cn(listToolbarFieldClassName(), listToolbarSearchClassName(), "pl-9 shadow-none")}
            aria-label="Search menu items"
            aria-keyshortcuts="/"
          />
        </div>
        {categories.length > 0 ? (
          <div className={posCategoryScrollClassName()} role="tablist" aria-label="Menu categories">
            <button
              type="button"
              role="tab"
              aria-selected={categoryFilter === null}
              className={posCategoryChipClassName(categoryFilter === null)}
              onClick={() => onCategoryFilterChange(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={categoryFilter === cat}
                className={posCategoryChipClassName(categoryFilter === cat)}
                onClick={() => onCategoryFilterChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-0 lg:pr-1 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6 space-y-3">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className={`w-10 h-10 animate-spin ${posLoadingSpinnerClassName()}`} />
        </div>
      ) : (
        <>
          {isFiltered && !loading && totalProducts > 0 ? (
            <p className="text-xs tabular-nums text-[var(--text-subtle)] px-0.5">
              {filteredProducts.length} of {totalProducts} items
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product: Product) => (
              <button
                key={product.id}
                type="button"
                className={posProductTileClassName()}
                onClick={() => onProductClick(product)}
                aria-label={`Add ${product.name}, ${formatCurrency(product.price)}`}
              >
                <span className={posProductTileCategoryClassName()}>{product.category}</span>
                <span className={posProductTileNameClassName()}>{product.name}</span>
                <div className={posProductTileFooterClassName()}>
                  <span className={posPriceClassName("text-base sm:text-lg")}>
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className={cn(posEmptyProductsClassName(), "col-span-full rounded-2xl py-12")}>
                {totalProducts === 0
                  ? "No menu items yet. Ask a manager to add products under Products → Menu Items."
                  : "No items match your search. Try another keyword or category."}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
