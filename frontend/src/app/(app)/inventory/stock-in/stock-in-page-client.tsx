"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, LayoutGrid, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { useStockIn } from "@/hooks/domains/useInventoryQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useAuth } from "@/context/AuthContext";
import { ButtonLink } from "@/components/ui/button-link";
import { StockInForm, type StockLineRow } from "@/components/inventory/StockInForm";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { useLineItemRows } from "@/hooks/useLineItemRows";
import { filterActive } from "@/lib/form";
import { getErrorMessage } from "@/lib/errors";
import type { Branch, Ingredient } from "@/types/api";

function emptyLine(): StockLineRow {
  return {
    rowId: crypto.randomUUID(),
    ingredientId: 0,
    quantity: 0,
    expiryDate: "",
  };
}

function isLineDirty(item: StockLineRow) {
  return item.ingredientId > 0 || item.quantity > 0 || (item.expiryDate?.trim().length ?? 0) > 0;
}

export default function StockInPageClient() {
  const { activeBranchId } = useAuth();
  const router = useRouter();
  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === activeBranchId)?.name;

  const {
    data: ingredientsData,
    isLoading: ingredientsLoading,
    isError: ingredientsError,
    error: ingredientsErr,
    refetch: refetchIngredients,
    isFetching: ingredientsFetching,
  } = useIngredients();
  const ingredients = filterActive((ingredientsData || []) as Ingredient[]);

  const stockInMutation = useStockIn();

  const {
    items,
    addRow: handleAddItem,
    removeRow: handleRemoveItem,
    updateRow: handleChange,
    duplicateKeys: duplicateIds,
    isDirty,
  } = useLineItemRows({
    createEmpty: emptyLine,
    isDirty: isLineDirty,
    duplicateKey: (item) => item.ingredientId,
  });

  const formDisabled =
    ingredientsLoading || ingredientsError || ingredients.length === 0;
  const validLineCount = useMemo(
    () => items.filter((i) => i.ingredientId > 0 && i.quantity > 0).length,
    [items],
  );
  const submitDisabled =
    stockInMutation.isPending ||
    formDisabled ||
    validLineCount === 0 ||
    duplicateIds.size > 0;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !stockInMutation.isPending) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, stockInMutation.isPending]);

  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm("Discard unsaved receipt lines?")) return;
    router.push("/inventory");
  }, [isDirty, router]);

  const handleSubmit = async () => {
    if (!activeBranchId) {
      toast.error("No active branch selected.");
      return;
    }

    if (duplicateIds.size > 0) {
      toast.error("Each ingredient can only appear once. Remove duplicate rows.");
      return;
    }

    const validItems = items.filter((i) => i.ingredientId > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid ingredient with quantity > 0.");
      return;
    }

    try {
      await stockInMutation.mutateAsync({
        branchId: activeBranchId,
        items: validItems.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : undefined,
        })),
      });
      toast.success("Stock received successfully!");
      router.push("/inventory/batches");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to receive stock"));
    }
  };

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to receive stock." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={ArrowDownToLine}
        accentHub="inventory"
        description="Record ad-hoc receipts not tied to a purchase order."
        branchScope={{ branchName }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/inventory" variant="outline" className="font-medium">
              <LayoutGrid className="w-4 h-4 mr-2" aria-hidden />
              Stock overview
            </ButtonLink>
            <ButtonLink href="/inventory/batches" variant="outline" className="font-medium">
              <ClipboardCheck className="w-4 h-4 mr-2" aria-hidden />
              View batches
            </ButtonLink>
          </div>
        }
      />

      <StockInForm
        ingredients={ingredients}
        ingredientsLoading={ingredientsLoading}
        ingredientsError={ingredientsError}
        ingredientsErr={ingredientsErr}
        ingredientsFetching={ingredientsFetching}
        onRefetchIngredients={() => void refetchIngredients()}
        items={items}
        duplicateIds={duplicateIds}
        formDisabled={formDisabled}
        validLineCount={validLineCount}
        submitDisabled={submitDisabled}
        isSubmitting={stockInMutation.isPending}
        onAddRow={handleAddItem}
        onRemoveRow={handleRemoveItem}
        onChange={handleChange}
        onCancel={handleCancel}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
}
