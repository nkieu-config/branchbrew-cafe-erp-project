"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useBranchInventory,
  useRecordWaste,
  useWasteLogs,
} from "@/hooks/domains/useInventoryQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useAuth } from "@/context/AuthContext";
import { WasteHistoryPanel } from "@/components/inventory/WasteHistoryPanel";
import { WasteRecordForm, type WasteLineRow } from "@/components/inventory/WasteRecordForm";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { useLineItemRows } from "@/hooks/useLineItemRows";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterActive } from "@/lib/form";
import { getErrorMessage } from "@/lib/errors";
import {
  extractWasteHistoryIngredients,
  filterWasteLogs,
  hasWasteHistoryFilters,
} from "@/lib/waste-filters";
import type { Ingredient } from "@/types/api";

function emptyLine(): WasteLineRow {
  return {
    rowId: crypto.randomUUID(),
    ingredientId: 0,
    quantity: 0,
    reason: "",
  };
}

function isLineDirty(item: WasteLineRow) {
  return (
    item.ingredientId > 0 ||
    item.quantity > 0 ||
    item.reason.trim().length > 0
  );
}

export default function WastePageClient() {
  const router = useRouter();
  const { activeBranchId } = useAuth();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;

  const {
    data: ingredientsData,
    isLoading: ingredientsLoading,
    isError: ingredientsError,
    error: ingredientsErr,
    refetch: refetchIngredients,
    isFetching: ingredientsFetching,
  } = useIngredients();
  const ingredients = filterActive((ingredientsData || []) as Ingredient[]);

  const { data: inventoryData = [] } = useBranchInventory(branchId);
  const stockByIngredientId = useMemo(() => {
    const map = new Map<number, number>();
    for (const record of inventoryData) {
      map.set(record.ingredientId, record.stock);
    }
    return map;
  }, [inventoryData]);

  const {
    data: wasteLogs = [],
    isLoading: logsLoading,
    isError: logsError,
    error: logsErr,
    refetch: refetchLogs,
    isFetching: logsFetching,
  } = useWasteLogs(branchId);
  const recordWasteMutation = useRecordWaste();

  const {
    items,
    addRow: handleAddItem,
    removeRow: handleRemoveItem,
    updateRow: handleChange,
    resetRows,
    duplicateKeys: duplicateIds,
    isDirty,
  } = useLineItemRows({
    createEmpty: emptyLine,
    isDirty: isLineDirty,
    duplicateKey: (item) => item.ingredientId,
  });

  const [historySearch, setHistorySearch] = useState("");
  const [ingredientFilter, setIngredientFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const debouncedHistorySearch = useDebouncedValue(historySearch.trim().toLowerCase(), 300);

  const formDisabled =
    ingredientsLoading || ingredientsError || ingredients.length === 0;
  const validLineCount = useMemo(
    () =>
      items.filter(
        (i) => i.ingredientId > 0 && i.quantity > 0 && i.reason.trim() !== "",
      ).length,
    [items],
  );
  const submitDisabled =
    recordWasteMutation.isPending ||
    formDisabled ||
    validLineCount === 0 ||
    duplicateIds.size > 0;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !recordWasteMutation.isPending) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, recordWasteMutation.isPending]);

  const filteredLogs = useMemo(
    () =>
      filterWasteLogs(wasteLogs, {
        search: debouncedHistorySearch,
        ingredientFilter,
        dateFrom,
        dateTo,
      }),
    [wasteLogs, debouncedHistorySearch, ingredientFilter, dateFrom, dateTo],
  );

  const historyFiltersActive = hasWasteHistoryFilters({
    search: historySearch,
    ingredientFilter,
    dateFrom,
    dateTo,
  });

  const historyIngredients = useMemo(
    () => extractWasteHistoryIngredients(wasteLogs),
    [wasteLogs],
  );

  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm("Discard unsaved waste lines?")) return;
    router.push("/inventory");
  }, [isDirty, router]);

  const handleSubmit = async () => {
    if (!branchId) {
      toast.error("No active branch selected.");
      return;
    }

    if (duplicateIds.size > 0) {
      toast.error("Each ingredient can only appear once. Remove duplicate rows.");
      return;
    }

    const validItems = items.filter(
      (i) => i.ingredientId > 0 && i.quantity > 0 && i.reason.trim() !== "",
    );
    if (validItems.length === 0) {
      toast.error(
        "Please add at least one valid ingredient with quantity > 0 and a reason.",
      );
      return;
    }

    try {
      await recordWasteMutation.mutateAsync({
        branchId,
        items: validItems.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          reason: i.reason.trim(),
        })),
      });
      toast.success("Waste recorded successfully!");
      resetRows();
      void refetchLogs();
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Failed to record waste. Not enough stock?"),
      );
    }
  };

  const resetHistoryFilters = useCallback(() => {
    setHistorySearch("");
    setIngredientFilter("ALL");
    setDateFrom("");
    setDateTo("");
  }, []);

  if (!branchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to record and view waste logs." />
    );
  }

  return (
    <div className="space-y-5">
      <WasteRecordForm
        ingredients={ingredients}
        ingredientsLoading={ingredientsLoading}
        ingredientsError={ingredientsError}
        ingredientsErr={ingredientsErr}
        ingredientsFetching={ingredientsFetching}
        onRefetchIngredients={() => void refetchIngredients()}
        stockByIngredientId={stockByIngredientId}
        items={items}
        duplicateIds={duplicateIds}
        formDisabled={formDisabled}
        validLineCount={validLineCount}
        submitDisabled={submitDisabled}
        isSubmitting={recordWasteMutation.isPending}
        onAddRow={handleAddItem}
        onRemoveRow={handleRemoveItem}
        onChange={handleChange}
        onCancel={handleCancel}
        onSubmit={() => void handleSubmit()}
      />

      <WasteHistoryPanel
        logs={wasteLogs}
        filteredLogs={filteredLogs}
        historyIngredients={historyIngredients}
        historySearch={historySearch}
        onHistorySearchChange={setHistorySearch}
        ingredientFilter={ingredientFilter}
        onIngredientFilterChange={setIngredientFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        hasHistoryFilters={historyFiltersActive}
        onResetFilters={resetHistoryFilters}
        logsLoading={logsLoading}
        logsError={logsError}
        logsErr={logsErr}
        logsFetching={logsFetching}
        onRefetchLogs={() => void refetchLogs()}
      />
    </div>
  );
}
