"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Loader2,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { useOrders } from "@/hooks/domains/useReportsQueries";
import { useProductsSummary } from "@/hooks/domains/useProductsSummary";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DataTable } from "@/components/shared/data-table";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { ProductsHubLinks } from "@/components/products/ProductsHubLinks";
import { FoodCostMarginPanel } from "@/components/products/FoodCostMarginPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { getErrorMessage } from "@/lib/errors";
import { formatBaht } from "@/lib/money";
import { calcProductFoodCost, foodCostStatus } from "@/lib/food-cost";
import {
  matchesFoodCostActiveFilter,
  matchesFoodCostStatusFilter,
  productFoodCostBucket,
  productHasMissingIngredientCost,
  type FoodCostActiveFilter,
  type FoodCostStatusFilter,
} from "@/lib/food-cost-filters";
import { productHasRecipe } from "@/lib/menu-product-filters";
import { buildProductsIngredientsUrl, parseProductsCostingSearchParams } from "@/lib/products-hub-url";
import {
  foodCostProgressIndicatorClassName,
  foodCostStatusClassName,
  formSelectContentClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  productsCategoryBadgeClassName,
  productsSectionPanelClassName,
  productsSummaryChipClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

const TARGET_FOOD_COST = 30;

function foodCostStatusLabel(bucket: ReturnType<typeof productFoodCostBucket>) {
  switch (bucket) {
    case "good":
      return "On target";
    case "warn":
      return "Watch";
    case "bad":
      return "High cost";
    case "no-recipe":
      return "No recipe";
    case "no-price":
      return "No price";
  }
}

function foodCostStatusTone(
  bucket: ReturnType<typeof productFoodCostBucket>,
): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (bucket) {
    case "good":
      return "success";
    case "warn":
      return "warning";
    case "bad":
      return "danger";
    case "no-recipe":
      return "neutral";
    case "no-price":
      return "info";
  }
}

export default function FoodCostPage() {
  const searchParams = useSearchParams();
  const {
    products,
    summary,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProductsSummary();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<FoodCostStatusFilter>("ALL");
  const [activeFilter, setActiveFilter] = useState<FoodCostActiveFilter>("ALL");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const parsed = parseProductsCostingSearchParams(searchParams);
    if (parsed.status !== "ALL") setStatusFilter(parsed.status);
    if (parsed.category !== "ALL") setCategoryFilter(parsed.category);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const product of products) {
      if (product.category) set.add(product.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const haystack = [
        product.name,
        product.category ?? "",
        String(product.id),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;
      const matchesStatus = matchesFoodCostStatusFilter(product, statusFilter);
      const matchesActive = matchesFoodCostActiveFilter(product, activeFilter);
      return matchesSearch && matchesCategory && matchesStatus && matchesActive;
    });
  }, [products, debouncedSearch, categoryFilter, statusFilter, activeFilter]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    activeFilter !== "ALL";

  const toggleStatusFilter = (next: FoodCostStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          title: "Menu Item",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: Product) => (
            <div>
              <span className={cn("font-bold", text.primary)}>{name}</span>
              {productHasMissingIngredientCost(record) && (
                <div
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                    metricValueClassName("amber"),
                  )}
                >
                  <AlertTriangle className="w-3 h-3" aria-hidden />
                  Missing ingredient cost
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
          responsive: ["md"],
          render: (category: string) =>
            category ? (
              <span className={productsCategoryBadgeClassName()}>{category}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Sale Price",
          dataIndex: "price",
          key: "price",
          align: "right" as const,
          render: (price: number) => (
            <span className={cn("font-bold tabular-nums", text.primary)}>
              {formatBaht(price)}
            </span>
          ),
        },
        {
          title: "Recipe Cost",
          key: "recipeCost",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: Product) => {
            if (!productHasRecipe(record)) {
              return <span className={text.muted}>—</span>;
            }
            const { cost } = calcProductFoodCost(record);
            return (
              <span className={cn("font-bold tabular-nums", metricValueClassName("red"))}>
                {formatBaht(cost)}
              </span>
            );
          },
        },
        {
          title: `Food Cost % (target ≤ ${TARGET_FOOD_COST}%)`,
          key: "foodCostPercent",
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            if (bucket === "no-recipe") {
              return (
                <Link href="/products" className={inlineLinkClassName()}>
                  Add recipe
                </Link>
              );
            }
            if (bucket === "no-price") {
              return <span className={text.muted}>Set sale price</span>;
            }

            const { foodCostPercent } = calcProductFoodCost(record);
            const status = foodCostStatus(foodCostPercent);
            const isWarning = status !== "good";
            const percent = parseFloat(foodCostPercent.toFixed(1));

            return (
              <div className="flex flex-wrap items-center gap-3 min-w-[8rem]">
                <Progress value={Math.min(percent, 100)} className="w-28 gap-1">
                  <ProgressTrack className="h-2">
                    <ProgressIndicator
                      className={foodCostProgressIndicatorClassName(isWarning)}
                    />
                  </ProgressTrack>
                  <ProgressValue
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      foodCostStatusClassName(status),
                    )}
                  />
                </Progress>
                {status === "bad" && (
                  <StatusBadge tone="danger" className="gap-1 font-bold">
                    <AlertTriangle className="w-3 h-3" aria-hidden />
                    High
                  </StatusBadge>
                )}
              </div>
            );
          },
        },
        {
          title: "Status",
          key: "status",
          responsive: ["lg"],
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            return (
              <StatusBadge tone={foodCostStatusTone(bucket)}>
                {foodCostStatusLabel(bucket)}
              </StatusBadge>
            );
          },
        },
        {
          title: "Recipe",
          key: "recipe",
          responsive: ["lg"],
          render: (_: unknown, record: Product) =>
            productHasRecipe(record) ? (
              <span className={tableCellMutedClassName()}>
                {record.recipeItems!.length} ingredient
                {record.recipeItems!.length === 1 ? "" : "s"}
              </span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "",
          key: "actions",
          width: 72,
          align: "right" as const,
          render: (_: unknown, record: Product) => (
            <TableActionButton
              icon={Edit}
              label={`Edit recipe for ${record.name}`}
              iconOnly
              tone="purple"
              onClick={() => handleEdit(record)}
            />
          ),
        },
      ] as ColumnsType<Product>,
    [handleEdit],
  );

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={BarChart3}
        accentHub="products"
        description="Analyze menu recipe costs against sale prices. Target food cost is 30% or lower."
        actions={<ProductsHubLinks current="costing" />}
      />

      <div className={productsSectionPanelClassName()}>
        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load menu items for food cost")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        {!isLoading && !isError && (
          <FoodCostMarginPanel
            orders={orders}
            theoreticalAvgPercent={summary.foodCost.avgPercent}
            ordersLoading={ordersLoading}
          />
        )}

        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} menu {summary.total === 1 ? "item" : "items"}
            </span>
            {summary.foodCost.avgPercent > 0 && (
              <span className={productsCategoryBadgeClassName()}>
                avg {summary.foodCost.avgPercent.toFixed(1)}% food cost
              </span>
            )}
            {summary.foodCost.good > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "good",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("good")}
              >
                {summary.foodCost.good} on target
              </button>
            )}
            {summary.foodCost.warn > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "warn",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleStatusFilter("warn")}
              >
                {summary.foodCost.warn} watch
              </button>
            )}
            {summary.foodCost.bad > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "bad",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleStatusFilter("bad")}
              >
                {summary.foodCost.bad} high cost
              </button>
            )}
            {summary.foodCost.noRecipe > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "no-recipe",
                  text.muted,
                )}
                onClick={() => toggleStatusFilter("no-recipe")}
              >
                {summary.foodCost.noRecipe} no recipe
              </button>
            )}
            {summary.foodCost.missingCost > 0 && (
              <Link
                href={buildProductsIngredientsUrl({ cost: "missing-cost" })}
                className={productsSummaryChipClassName(
                  statusFilter === "missing-cost",
                  metricValueClassName("amber"),
                )}
              >
                {summary.foodCost.missingCost} missing cost
              </Link>
            )}
            {summary.total === 0 && (
              <span className={text.muted}>
                No menu items yet —{" "}
                <Link href="/products" className={inlineLinkClassName()}>
                  add menu items
                </Link>{" "}
                and recipes to analyze food cost
              </span>
            )}
            {isFetching && !isLoading && (
              <span className={cn("inline-flex items-center gap-1.5", text.muted)}>
                <Loader2
                  className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Updating…
              </span>
            )}
          </div>
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search menu items…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setCategoryFilter("ALL");
            setStatusFilter("ALL");
            setActiveFilter("ALL");
          }}
          filters={
            <>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  if (value != null) setCategoryFilter(value);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by category"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (value != null) setStatusFilter(value as FoodCostStatusFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[200px]")}
                  aria-label="Filter by food cost status"
                >
                  <SelectValue placeholder="All food cost levels" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All food cost levels</SelectItem>
                  <SelectItem value="good">On target (≤30%)</SelectItem>
                  <SelectItem value="warn">Watch (31–40%)</SelectItem>
                  <SelectItem value="bad">High cost (&gt;40%)</SelectItem>
                  <SelectItem value="no-recipe">No recipe</SelectItem>
                  <SelectItem value="missing-cost">Missing ingredient cost</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  if (value != null) setActiveFilter(value as FoodCostActiveFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                  aria-label="Filter by menu status"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="inactive">Inactive only</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load menu items")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
          hideBorders
          emptyDescription={
            hasActiveFilters
              ? "No menu items match your food cost filters."
              : "No menu items yet. Add recipes on Menu Items to track food cost."
          }
        />
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct ?? undefined}
      />
    </>
  );
}
