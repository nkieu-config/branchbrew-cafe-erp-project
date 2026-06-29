"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBranchInventory,
  useRecordWaste,
  useWasteLogs,
} from "@/hooks/domains/useInventoryQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, History, Loader2, LayoutGrid, ClipboardCheck } from "lucide-react";
import { filterActive } from "@/lib/form";
import type { Ingredient, WasteLineItem, Branch, WasteLog } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { DataTable } from "@/components/shared/data-table";
import {
  FormEmptyIngredientsBanner,
  FormPanel,
  FormPanelFooter,
} from "@/components/shared/form-panel";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterDate, ListFilterRow, ListFilterSelect } from "@/components/shared/list-filters";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLineItemRows } from "@/hooks/useLineItemRows";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDateTime } from "@/lib/intl-date";
import { formValidationHintClassName } from "@/lib/theme/color-helpers";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { listToolbarFieldClassName, tableCellMutedClassName } from "@/lib/theme/feedback";
import { metricValueClassName } from "@/lib/theme/metric";
import { formFieldInsetClassName, formSelectContentClassName, formLineFieldClassName, formLineQtyFieldClassName, formLineReasonFieldClassName, formLineRowClassName, formPanelHeaderClassName, formRemoveButtonClassName, hubDangerActionClassName, inventorySectionPanelClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

type WasteLineRow = WasteLineItem & { rowId: string };

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

function logMatchesSearch(log: WasteLog, query: string) {
  const reason = log.reason.toLowerCase();
  const ingredient = log.ingredient?.name?.toLowerCase() ?? "";
  const recordedBy = log.recordedBy?.name?.toLowerCase() ?? "";
  return (
    reason.includes(query) ||
    ingredient.includes(query) ||
    recordedBy.includes(query)
  );
}

export default function WasteLogPage() {
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

  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === branchId)?.name;

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

  const filteredLogs = useMemo(() => {
    return wasteLogs.filter((log: WasteLog) => {
      if (debouncedHistorySearch && !logMatchesSearch(log, debouncedHistorySearch)) {
        return false;
      }
      if (ingredientFilter !== "ALL" && log.ingredientId !== Number(ingredientFilter)) {
        return false;
      }
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (new Date(log.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        if (new Date(log.createdAt) > to) return false;
      }
      return true;
    });
  }, [wasteLogs, debouncedHistorySearch, ingredientFilter, dateFrom, dateTo]);

  const hasHistoryFilters =
    historySearch.trim().length > 0 ||
    ingredientFilter !== "ALL" ||
    dateFrom.length > 0 ||
    dateTo.length > 0;

  const historyIngredients = useMemo(() => {
    const seen = new Map<number, string>();
    for (const log of wasteLogs) {
      if (log.ingredient) {
        seen.set(log.ingredientId, log.ingredient.name);
      }
    }
    return [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wasteLogs]);

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

  const historyColumns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "createdAt",
          key: "createdAt",
          width: 140,
          responsive: ["md"],
          render: (v: string) => (
            <span className={cn("whitespace-nowrap tabular-nums text-sm", text.subtle)}>
              {formatDateTime(v)}
            </span>
          ),
        },
        {
          title: "Ingredient",
          key: "ingredient",
          render: (_: unknown, row: WasteLog) => (
            <div className="min-w-0">
              <span className={cn("font-medium", text.primary)}>
                {row.ingredient?.name ?? `#${row.ingredientId}`}
              </span>
              <p className={cn("mt-0.5 text-xs md:hidden", text.muted)}>
                {formatDateTime(row.createdAt)}
              </p>
            </div>
          ),
        },
        {
          title: "Qty",
          dataIndex: "quantity",
          key: "quantity",
          align: "right" as const,
          width: 96,
          render: (qty: number, row: WasteLog) => (
            <span className={cn("font-mono tabular-nums text-sm", text.subtle)}>
              {Number(qty).toFixed(2)}
              {row.ingredient?.unit ? (
                <span className={cn("ml-1 text-xs", text.muted)}>{row.ingredient.unit}</span>
              ) : null}
            </span>
          ),
        },
        {
          title: "Reason",
          dataIndex: "reason",
          key: "reason",
          responsive: ["sm"],
          render: (reason: string) => (
            <span className={text.secondary}>{reason}</span>
          ),
        },
        {
          title: "Recorded by",
          key: "recordedBy",
          responsive: ["lg"],
          render: (_: unknown, row: WasteLog) => (
            <span className={tableCellMutedClassName()}>
              {row.recordedBy?.name ?? "—"}
            </span>
          ),
        },
      ] as ColumnsType<WasteLog>,
    [],
  );

  if (!branchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to record and view waste logs." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={Trash2}
        accentHub="inventory"
        description="Record waste deductions and review branch history."
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

      <FormPanel>
        <div className={formPanelHeaderClassName()}>
          <h2 className={typeHeadingClassName("text-lg flex items-center gap-2")}>
            <Trash2 className={cn("w-5 h-5", metricValueClassName("red"))} aria-hidden />
            Record Waste
          </h2>
          <p className={cn("text-sm mt-1", text.muted)}>
            One row per item — stock is deducted immediately from branch totals.
          </p>
          {ingredientsFetching && !ingredientsLoading && (
            <span className={cn("inline-flex items-center gap-1.5 text-xs mt-2", text.muted)}>
              <Loader2
                className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              Updating ingredients…
            </span>
          )}
        </div>

        <HubListPage.Error
          message={
            ingredientsError
              ? getErrorMessage(ingredientsErr, "Failed to load ingredients")
              : undefined
          }
          onRetry={() => void refetchIngredients()}
          loading={ingredientsFetching}
          className="mb-4"
        />

        {!ingredientsLoading && !ingredientsError && ingredients.length === 0 && (
          <FormEmptyIngredientsBanner className="mb-4" />
        )}

        <div className="space-y-4">
          {items.map((item, idx) => {
            const isDuplicate =
              item.ingredientId > 0 && duplicateIds.has(item.ingredientId);
            const stockOnHand =
              item.ingredientId > 0
                ? stockByIngredientId.get(item.ingredientId)
                : undefined;
            const selectedIngredient = ingredients.find((ing) => ing.id === item.ingredientId);

            return (
              <div key={item.rowId} className={formLineRowClassName()}>
                <div className={formLineFieldClassName()}>
                  <Label htmlFor={`waste-ingredient-${item.rowId}`} className={text.secondary}>
                    Ingredient
                  </Label>
                  <Select
                    value={item.ingredientId === 0 ? "" : String(item.ingredientId)}
                    onValueChange={(value) => {
                      if (value == null) return;
                      handleChange(idx, "ingredientId", Number(value));
                    }}
                    disabled={formDisabled}
                  >
                    <SelectTrigger
                      id={`waste-ingredient-${item.rowId}`}
                      className={formFieldInsetClassName("h-11 w-full")}
                    >
                      <SelectValue
                        placeholder={
                          ingredientsLoading ? "Loading ingredients…" : "Select ingredient…"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName()}>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={String(ing.id)}>
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isDuplicate ? (
                    <StatusBadge tone="warning" className="mt-1 w-fit">
                      Duplicate ingredient — combine into one row
                    </StatusBadge>
                  ) : null}
                  {item.ingredientId > 0 && stockOnHand !== undefined ? (
                    <p className={cn("text-xs mt-1", text.muted)}>
                      Stock on hand:{" "}
                      <span className={cn("font-medium tabular-nums", text.secondary)}>
                        {stockOnHand.toFixed(2)} {selectedIngredient?.unit ?? ""}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className={formLineQtyFieldClassName()}>
                  <Label htmlFor={`waste-quantity-${item.rowId}`} className={text.secondary}>
                    Quantity
                  </Label>
                  <Input
                    id={`waste-quantity-${item.rowId}`}
                    name={`waste-quantity-${item.rowId}`}
                    className={formFieldInsetClassName("h-11")}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Qty"
                    value={item.quantity || ""}
                    disabled={formDisabled}
                    onChange={(e) =>
                      handleChange(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>

                <div className={formLineReasonFieldClassName()}>
                  <Label htmlFor={`waste-reason-${item.rowId}`} className={text.secondary}>
                    Reason
                  </Label>
                  <Input
                    id={`waste-reason-${item.rowId}`}
                    name={`waste-reason-${item.rowId}`}
                    className={formFieldInsetClassName("h-11")}
                    type="text"
                    placeholder="e.g. Expired, Spilled"
                    value={item.reason}
                    disabled={formDisabled}
                    onChange={(e) => handleChange(idx, "reason", e.target.value)}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className={formRemoveButtonClassName(
                    "min-h-[44px] min-w-[44px] h-11 w-11 self-end",
                  )}
                  aria-label="Remove line"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length === 1 || formDisabled}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            className="w-full min-h-[44px] border-dashed"
            disabled={formDisabled}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden /> Add Another Row
          </Button>
        </div>

        <FormPanelFooter
          status={
            <>
              <p aria-live="polite">
                {validLineCount} line{validLineCount === 1 ? "" : "s"} ready to record
              </p>
              {ingredientsError ? (
                <p className={formValidationHintClassName()}>
                  Fix the ingredient load error above before confirming.
                </p>
              ) : null}
              {duplicateIds.size > 0 ? (
                <p className={formValidationHintClassName()}>
                  Remove duplicate ingredients before confirming.
                </p>
              ) : null}
            </>
          }
        >
          <Button type="button" variant="outline" className="min-h-[44px]" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            className={hubDangerActionClassName("min-h-[44px]")}
            disabled={submitDisabled}
          >
            {recordWasteMutation.isPending ? (
              <>
                <Loader2
                  className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Recording…
              </>
            ) : (
              "Confirm Waste Deduction"
            )}
          </Button>
        </FormPanelFooter>
      </FormPanel>

      <div className={inventorySectionPanelClassName()}>
        <div className={formPanelHeaderClassName("mb-4")}>
          <h2 className={typeHeadingClassName("text-lg flex items-center gap-2")}>
            <History className={cn("w-5 h-5", metricValueClassName("slate"))} aria-hidden />
            Waste History
          </h2>
          <p className={cn("text-sm mt-1", text.muted)}>
            Recent waste entries for this branch.
          </p>
        </div>

        <HubListPage>
        <HubListPage.Error
          message={
            logsError ? getErrorMessage(logsErr, "Failed to load waste logs") : undefined
          }
          onRetry={() => void refetchLogs()}
          loading={logsFetching}
        />

        <HubListPage.Toolbar
          search={historySearch}
          onSearchChange={setHistorySearch}
          searchPlaceholder="Search reason, ingredient, or recorder…"
          showReset={hasHistoryFilters}
          onReset={() => {
            setHistorySearch("");
            setIngredientFilter("ALL");
            setDateFrom("");
            setDateTo("");
          }}
          filters={
            <ListFilterRow>
              <ListFilterSelect
                value={ingredientFilter}
                onValueChange={setIngredientFilter}
                ariaLabel="Filter by ingredient"
                widthClassName="w-full sm:w-[200px]"
                options={[
                  { value: "ALL", label: "All ingredients" },
                  ...historyIngredients.map((ing) => ({
                    value: String(ing.id),
                    label: ing.name,
                  })),
                ]}
              />
              <ListFilterDate
                value={dateFrom}
                onChange={setDateFrom}
                ariaLabel="Filter from date"
              />
              <ListFilterDate
                value={dateTo}
                onChange={setDateTo}
                ariaLabel="Filter to date"
                min={dateFrom || undefined}
              />
            </ListFilterRow>
          }
        />

        <HubListPage.Count
          isLoading={logsLoading}
          isError={logsError}
          isFetching={logsFetching}
          hasActiveFilters={hasHistoryFilters}
          filteredCount={filteredLogs.length}
          totalCount={wasteLogs.length}
          itemLabel="entry"
          itemLabelPlural="entries"
          emptyLabel="No waste recorded yet"
        />

        <DataTable
          {...hubListDataTableProps()}
          loading={logsLoading}
          rowKey="id"
          dataSource={filteredLogs}
          columns={historyColumns}
          scroll={{ x: undefined }}
          emptyDescription={
            hasHistoryFilters
              ? "No waste logs match your filters."
              : "No waste entries recorded for this branch yet."
          }
        />
        </HubListPage>
      </div>
    </div>
  );
}
