"use client";

import { useCallback, useEffect, useMemo, useState, useDeferredValue } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useIngredients,
  useDeleteIngredient,
} from "@/hooks/domains/useProductQueries";
import { Button } from "@/components/ui/button";
import { IngredientFormModal } from "@/components/products/IngredientFormModal";
import { IngredientsTable } from "@/components/products/IngredientsTable";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getErrorMessage } from "@/lib/errors";
import {
  filterIngredients,
  hasIngredientFilters,
  summarizeIngredients,
  type IngredientCostFilter,
  type IngredientStatusFilter,
} from "@/lib/ingredient-filters";
import { parseProductsIngredientsSearchParams } from "@/lib/products-hub-url";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { productsSectionPanelClassName } from "@/lib/theme/hub-products";
import type { Ingredient } from "@/types/api";

export default function IngredientsPageClient() {
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
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [statusFilter, setStatusFilter] = useState<IngredientStatusFilter>("ALL");
  const [costFilter, setCostFilter] = useState<IngredientCostFilter>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);

  const costParam = searchParams.get("cost");

  useEffect(() => {
    const parsed = parseProductsIngredientsSearchParams(
      new URLSearchParams(costParam ? `cost=${costParam}` : ""),
    );
    if (parsed.cost !== "ALL") setCostFilter(parsed.cost);
  }, [costParam]);

  const summary = useMemo(
    () => summarizeIngredients(ingredients ?? []),
    [ingredients],
  );

  const filteredIngredients = useMemo(
    () =>
      filterIngredients(ingredients ?? [], {
        search: deferredSearch,
        statusFilter,
        costFilter,
      }),
    [ingredients, deferredSearch, statusFilter, costFilter],
  );

  const hasActiveFilters = hasIngredientFilters({
    search,
    statusFilter,
    costFilter,
  });

  const handleEdit = useCallback((ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedIngredient(null);
    setIsModalOpen(true);
  }, []);

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

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleAddNew} className={hubCtaClassName("products")}>
          <Plus className="w-4 h-4 mr-2" aria-hidden />
          Add ingredient
        </Button>
      </div>

      <HubListPage className={productsSectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load ingredients") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
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
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as IngredientStatusFilter)}
                ariaLabel="Filter by status"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <ListFilterSelect
                value={costFilter}
                onValueChange={(value) => setCostFilter(value as IngredientCostFilter)}
                ariaLabel="Filter by cost data"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All" },
                  { value: "missing-cost", label: "Missing cost" },
                ]}
              />
            </>
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredIngredients.length}
          totalCount={summary.total}
          itemLabel="ingredient"
          emptyLabel="No ingredients yet"
        />

        <IngredientsTable
          ingredients={filteredIngredients}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      </HubListPage>

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
            ? `Remove "${deleteTarget.name}"?`
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
