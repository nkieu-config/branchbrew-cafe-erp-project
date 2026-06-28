"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useIngredients,
  useDeleteIngredient,
} from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Plus,
  Edit,
  Trash2,
  Leaf,
  Loader2,
  ArrowDownToLine,
  Building2,
} from "lucide-react";
import { IngredientFormModal } from "@/components/products/IngredientFormModal";
import { ProductsHubLinks } from "@/components/products/ProductsHubLinks";
import { DataTable } from "@/components/shared/data-table";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import {
  ingredientIsActive,
  ingredientMissingCost,
  matchesIngredientCostFilter,
  matchesIngredientStatusFilter,
  type IngredientCostFilter,
  type IngredientStatusFilter,
} from "@/lib/ingredient-filters";
import { parseProductsIngredientsSearchParams } from "@/lib/products-hub-url";
import {
  formSelectContentClassName,
  hubCtaClassName,
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
import { toast } from "sonner";
import type { Ingredient } from "@/types/api";

export default function IngredientsPage() {
  const searchParams = useSearchParams();
  const {
    data: ingredients,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useIngredients();
  const deleteMutation = useDeleteIngredient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<IngredientStatusFilter>("ALL");
  const [costFilter, setCostFilter] = useState<IngredientCostFilter>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);

  useEffect(() => {
    const parsed = parseProductsIngredientsSearchParams(searchParams);
    if (parsed.cost !== "ALL") setCostFilter(parsed.cost);
  }, [searchParams]);

  const summary = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let missingCost = 0;
    for (const item of ingredients ?? []) {
      if (ingredientIsActive(item)) active += 1;
      else inactive += 1;
      if (ingredientMissingCost(item)) missingCost += 1;
    }
    return { total: ingredients?.length ?? 0, active, inactive, missingCost };
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return (ingredients ?? []).filter((item: Ingredient) => {
      const haystack = [
        item.name,
        item.unit,
        item.primarySupplier?.name ?? "",
        String(item.id),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      const matchesStatus = matchesIngredientStatusFilter(item, statusFilter);
      const matchesCost = matchesIngredientCostFilter(item, costFilter);
      return matchesSearch && matchesStatus && matchesCost;
    });
  }, [ingredients, debouncedSearch, statusFilter, costFilter]);

  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== "ALL" || costFilter !== "ALL";

  const handleEdit = useCallback((ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedIngredient(null);
    setIsModalOpen(true);
  }, []);

  const toggleStatusFilter = (next: IngredientStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const toggleCostFilter = () => {
    setCostFilter((current) => (current === "missing-cost" ? "ALL" : "missing-cost"));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Ingredient deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete ingredient"));
    }
  };

  const columns = useMemo(
    () =>
      [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          responsive: ["lg"],
          render: (id: number) => (
            <span className={tableCellMutedClassName()}>#{id}</span>
          ),
        },
        {
          title: "Ingredient Name",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={cn("font-bold", text.primary)}>{name}</span>
          ),
        },
        {
          title: "Unit",
          dataIndex: "unit",
          key: "unit",
          responsive: ["md"],
          render: (unit: string) => (
            <span className={productsCategoryBadgeClassName()}>{unit}</span>
          ),
        },
        {
          title: "Cost / Unit (฿)",
          dataIndex: "costPerUnit",
          key: "costPerUnit",
          render: (costPerUnit?: number) => {
            const missing = costPerUnit == null || costPerUnit <= 0;
            return (
              <span
                className={cn(
                  "font-bold tabular-nums",
                  missing ? metricValueClassName("amber") : text.primary,
                )}
              >
                {!missing ? formatBaht(costPerUnit) : "—"}
              </span>
            );
          },
        },
        {
          title: "Primary Supplier",
          key: "primarySupplier",
          responsive: ["md"],
          render: (_: unknown, record: Ingredient) =>
            record.primarySupplier?.name ? (
              <Link
                href="/procurement/suppliers"
                className={cn("text-sm font-medium hover:opacity-80", text.secondary)}
              >
                {record.primarySupplier.name}
              </Link>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Status",
          key: "isActive",
          render: (_: unknown, record: Ingredient) =>
            ingredientIsActive(record) ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt?: string) => (
            <span className={cn("text-sm font-medium", text.muted)}>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>
          ),
        },
        {
          title: "",
          key: "actions",
          width: 96,
          align: "right" as const,
          render: (_: unknown, record: Ingredient) => (
            <div className="flex items-center justify-end gap-1">
              <TableActionButton
                icon={Edit}
                label={`Edit ${record.name}`}
                iconOnly
                tone="purple"
                onClick={() => handleEdit(record)}
              />
              <TableActionButton
                icon={Trash2}
                label={`Delete ${record.name}`}
                iconOnly
                destructive
                onClick={() => setDeleteTarget(record)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Ingredient>,
    [handleEdit],
  );

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={Leaf}
        accentHub="products"
        description="Manage all raw materials used in your recipes."
        actions={
          <ProductsHubLinks
            current="ingredients"
            contextual={
              <>
                <ButtonLink href="/inventory/stock-in" variant="outline" className="font-medium">
                  <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden />
                  Receive Stock
                </ButtonLink>
                <ButtonLink href="/procurement/suppliers" variant="outline" className="font-medium">
                  <Building2 className="w-4 h-4 mr-2" aria-hidden />
                  Suppliers
                </ButtonLink>
              </>
            }
          >
            <Button onClick={handleAddNew} className={hubCtaClassName("products", "font-bold")}>
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Add Ingredient
            </Button>
          </ProductsHubLinks>
        }
      />

      <div className={productsSectionPanelClassName()}>
        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} ingredient{summary.total === 1 ? "" : "s"}
            </span>
            {summary.active > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "active",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("active")}
              >
                {summary.active} active
              </button>
            )}
            {summary.inactive > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  statusFilter === "inactive",
                  text.muted,
                )}
                onClick={() => toggleStatusFilter("inactive")}
              >
                {summary.inactive} inactive
              </button>
            )}
            {summary.missingCost > 0 && (
              <button
                type="button"
                className={productsSummaryChipClassName(
                  costFilter === "missing-cost",
                  metricValueClassName("amber"),
                )}
                onClick={toggleCostFilter}
              >
                {summary.missingCost} missing cost
              </button>
            )}
            {summary.total === 0 && (
              <span className={text.muted}>
                No ingredients yet — used in{" "}
                <Link href="/products" className={inlineLinkClassName()}>
                  menu recipes
                </Link>
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
          searchPlaceholder="Search ingredients…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStatusFilter("ALL");
            setCostFilter("ALL");
          }}
          filters={
            <>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (value != null) setStatusFilter(value as IngredientStatusFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={costFilter}
                onValueChange={(value) => {
                  if (value != null) setCostFilter(value as IngredientCostFilter);
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[200px]")}
                  aria-label="Filter by cost data"
                >
                  <SelectValue placeholder="All cost levels" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All cost levels</SelectItem>
                  <SelectItem value="missing-cost">Missing cost</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load ingredients")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            hasActiveFilters
              ? "No ingredients match your filters."
              : "No ingredients yet. Add raw materials to build menu recipes and production BOMs."
          }
          columns={columns}
          dataSource={filteredIngredients}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
          hideBorders
        />
      </div>

      <IngredientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIngredient(null);
        }}
        ingredient={selectedIngredient ?? undefined}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete ingredient?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.name}" from the catalog? This cannot be undone if it is referenced by recipes.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
