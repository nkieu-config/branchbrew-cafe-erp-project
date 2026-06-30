"use client";

import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HubListPage } from "@/components/shared/hub-list-page";
import { decorativeIconClassName } from "@/lib/theme/color-helpers";
import {
  posAddButtonClassName,
  posCategoryChipClassName,
  posEmptyProductsClassName,
  posInputClassName,
  posLoadingSpinnerClassName,
  posPriceClassName,
  posProductCardClassName,
  posStickyFilterBarClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
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
  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-0 lg:pr-2 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10 space-y-4">
      <HubListPage.Error
        message={
          productsError ? getErrorMessage(productsErr, "Failed to load menu items") : undefined
        }
        onRetry={onRetry}
        loading={productsFetching}
      />
      <div className={posStickyFilterBarClassName()}>
        <div className="relative">
          <Search
            className={decorativeIconClassName(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
            )}
            aria-hidden
          />
          <Input
            type="search"
            value={productSearch}
            onChange={(e) => onProductSearchChange(e.target.value)}
            placeholder="Search menu items…"
            className={cn(posInputClassName(), "pl-9 min-h-[44px]")}
            aria-label="Search menu items"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={posCategoryChipClassName(categoryFilter === null)}
              onClick={() => onCategoryFilterChange(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={posCategoryChipClassName(categoryFilter === cat)}
                onClick={() => onCategoryFilterChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className={`w-10 h-10 animate-spin ${posLoadingSpinnerClassName()}`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((product: Product) => (
            <Card key={product.id} className={posProductCardClassName()}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className={`text-lg ${text.primary}`}>{product.name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex justify-between items-center">
                <span className={posPriceClassName()}>{formatCurrency(product.price)}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(posAddButtonClassName(), "min-h-[44px]")}
                  onClick={(event) => {
                    event.stopPropagation();
                    onProductClick(product);
                  }}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className={posEmptyProductsClassName()}>
              {totalProducts === 0
                ? "No menu items yet. Ask a manager to add products under Products → Menu Items."
                : "No items match your search. Try another keyword or category."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
