"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Coffee } from "lucide-react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DataTable } from "@/components/shared/data-table";
import { HubCard } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { formatBaht } from "@/lib/money";
import { calcProductFoodCost, foodCostStatus } from "@/lib/food-cost";
import {
  foodCostStatusClassName,
  hubCtaClassName,
  inlineLinkClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

export default function ProductsPage() {
  const { data: products, isLoading, isError, error, refetch, isFetching } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "inactive">("ALL");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products ?? []) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products ?? []).filter((p: Product) => {
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "active" ? p.isActive !== false : p.isActive === false);
      const haystack = [p.name, p.category, String(p.id)].join(" ").toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [products, categoryFilter, statusFilter, debouncedSearch]);

  const hasActiveFilters =
    search.trim().length > 0 || categoryFilter !== "ALL" || statusFilter !== "ALL";

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <HubCard
        title="Menu Items"
        icon={Coffee}
        description="Manage products that appear on the POS terminal."
        actions={
          <Button onClick={handleAddNew} className={hubCtaClassName("products")}>
            <Plus className="w-4 h-4 mr-2" /> Add Menu Item
          </Button>
        }
      >
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search menu items…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setCategoryFilter("ALL");
            setStatusFilter("ALL");
          }}
          filters={
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={cn(
                  "min-h-[44px] rounded-md border px-3 text-sm",
                  "border-[var(--border)] bg-[var(--table-container-bg)] text-[var(--foreground)]",
                )}
                aria-label="Filter by category"
              >
                <option value="ALL">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "ALL" | "active" | "inactive")}
                className={cn(
                  "min-h-[44px] rounded-md border px-3 text-sm",
                  "border-[var(--border)] bg-[var(--table-container-bg)] text-[var(--foreground)]",
                )}
                aria-label="Filter by status"
              >
                <option value="ALL">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          }
        />
        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load menu items")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            hasActiveFilters
              ? "No menu items match your filters."
              : "No menu items yet. Add raw ingredients first, then create menu items for the POS."
          }
          columns={[
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className={tableCellMutedClassName()}>#{id}</span>,
            },
            {
              title: "Menu Name",
              dataIndex: "name",
              key: "name",
              render: (name) => <span className={`font-medium ${text.primary}`}>{name}</span>,
            },
            {
              title: "Category",
              dataIndex: "category",
              key: "category",
              render: (category) => <StatusBadge tone="category">{category}</StatusBadge>,
            },
            {
              title: "Price (฿)",
              dataIndex: "price",
              key: "price",
              render: (price) => <span className={`font-bold tabular-nums ${text.secondary}`}>{formatBaht(price)}</span>,
            },
            {
              title: "Food Cost %",
              key: "foodCost",
              render: (_: unknown, record: Product) => {
                const { cost, foodCostPercent } = calcProductFoodCost(record);
                const status = foodCostStatus(foodCostPercent);
                return (
                  <div>
                    <span className={foodCostStatusClassName(status)}>{foodCostPercent.toFixed(1)}%</span>
                    <div className={`text-xs ${tableCellMutedClassName()}`}>COGS {formatBaht(cost)}</div>
                  </div>
                );
              },
            },
            {
              title: "Status",
              key: "isActive",
              render: (_: unknown, record: Product) =>
                record.isActive !== false ? (
                  <StatusBadge tone="success">Active</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Inactive</StatusBadge>
                ),
            },
            {
              title: "Menu Recipe",
              key: "recipe",
              render: (_: unknown, record: Product) =>
                record.recipeItems && record.recipeItems.length > 0 ? (
                  <StatusBadge tone="info">{record.recipeItems.length} ingredients</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">No Menu Recipe</StatusBadge>
                ),
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_: unknown, record: Product) => (
                <TableActionButton icon={Edit} label="Edit" onClick={() => handleEdit(record)} />
              ),
            },
          ]}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          hideBorders
        />
        {!isLoading && (products?.length ?? 0) === 0 && (
          <p className={`text-sm mt-4 ${text.muted}`}>
            Setting up a new menu? Start with{" "}
            <Link href="/products/ingredients" className={inlineLinkClassName()}>
              Raw Ingredients
            </Link>
            , then return here to add menu items.
          </p>
        )}
      </HubCard>

      <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct ?? undefined} />
    </>
  );
}
