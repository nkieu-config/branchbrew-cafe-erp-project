"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBranchInventory } from "@/hooks/domains/useInventoryQueries";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { PackageOpen, AlertTriangle, ArrowDownToLine, ClipboardCheck, Loader2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StockTransfersPanel } from "@/components/inventory/StockTransfersPanel";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import {
  hubCtaClassName,
  inventorySectionPanelClassName,
  inventorySummaryChipClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  formSelectContentClassName,
  stockLevel,
  stockLevelLabel,
  stockLevelStatusTone,
  stockLevelValueClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

import type { BranchInventory, Branch, Ingredient, Role } from "@/types/api";

type InventoryRow = BranchInventory & { ingredient?: { name: string; unit: string } };
/** `attention` = low + out (matches dashboard ?filter=low deep link). */
type StockFilter = "ALL" | "ok" | "low" | "out" | "attention";

function canReceiveStock(role: Role | undefined) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

function ingredientDisplayName(record: InventoryRow) {
  return record.ingredient?.name ?? `#${record.ingredientId}`;
}

function matchesStockFilter(level: ReturnType<typeof stockLevel>, filter: StockFilter) {
  if (filter === "ALL") return true;
  if (filter === "attention") return level === "low" || level === "out";
  return level === filter;
}

export default function InventoryBalancePage() {
  const router = useRouter();
  const { activeBranchId, user } = useAuth();
  const role = user?.role as Role | undefined;
  const showGrnAction = canReceiveStock(role);
  const { data: branches = [] } = useBranches();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchId)?.name;
  const {
    data: inventoryData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBranchInventory(activeBranchId || undefined);
  const inventory = inventoryData || [];

  const searchParams = useSearchParams();
  const attentionFromUrl = searchParams.get("filter") === "low";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [stockFilter, setStockFilter] = useState<StockFilter>(
    attentionFromUrl ? "attention" : "ALL",
  );

  useEffect(() => {
    if (searchParams.get("filter") === "low") setStockFilter("attention");
  }, [searchParams]);

  const stockSummary = useMemo(() => {
    let low = 0;
    let out = 0;
    for (const record of inventory) {
      const level = stockLevel(record.stock, record.minStock);
      if (level === "out") out += 1;
      else if (level === "low") low += 1;
    }
    return { total: inventory.length, low, out };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((record: InventoryRow) => {
      const level = stockLevel(record.stock, record.minStock);
      const matchesLevel = matchesStockFilter(level, stockFilter);
      const name = record.ingredient?.name?.toLowerCase() ?? "";
      const matchesSearch = !debouncedSearch || name.includes(debouncedSearch);
      return matchesLevel && matchesSearch;
    });
  }, [inventory, debouncedSearch, stockFilter]);

  const hasActiveFilters = search.trim().length > 0 || stockFilter !== "ALL";

  const transferSourceInventories = useMemo(
    () =>
      inventory.flatMap((record: InventoryRow) => {
        if (!record.ingredient) return [];
        return [{ ingredient: record.ingredient as Ingredient, stock: record.stock }];
      }),
    [inventory],
  );

  if (!activeBranchId) {
    return <BranchEmptyState description="Select a branch in the top bar to view stock balances." />;
  }

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={PackageOpen}
        accentHub="inventory"
        description="Current aggregate stock for all raw ingredients at this branch."
        branchScope={{ branchName }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/inventory/batches" variant="outline" className="font-medium">
              <ClipboardCheck className="w-4 h-4 mr-2" aria-hidden />
              View batches
            </ButtonLink>
            {showGrnAction && (
              <ButtonLink href="/inventory/stock-in" className={hubCtaClassName("inventory", "font-bold")}>
                <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden />
                Receive stock
              </ButtonLink>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        <div className={inventorySectionPanelClassName()}>
        {!isLoading && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {stockSummary.total} ingredient{stockSummary.total === 1 ? "" : "s"}
            </span>
            {stockSummary.low > 0 ? (
              <button
                type="button"
                className={inventorySummaryChipClassName(
                  stockFilter === "low",
                  stockLevelValueClassName("low"),
                )}
                onClick={() => setStockFilter(stockFilter === "low" ? "ALL" : "low")}
              >
                {stockSummary.low} low stock
              </button>
            ) : null}
            {stockSummary.out > 0 ? (
              <button
                type="button"
                className={inventorySummaryChipClassName(
                  stockFilter === "out",
                  stockLevelValueClassName("out"),
                )}
                onClick={() => setStockFilter(stockFilter === "out" ? "ALL" : "out")}
              >
                {stockSummary.out} out of stock
              </button>
            ) : null}
            {stockSummary.low === 0 && stockSummary.out === 0 && (
              <span className={text.muted}>All items in stock</span>
            )}
            {isFetching && !isLoading && (
              <span className={`inline-flex items-center gap-1.5 ${text.muted}`}>
                <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
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
            setStockFilter("ALL");
          }}
          filters={
            <Select
              value={stockFilter}
              onValueChange={(value) => {
                if (value != null) setStockFilter(value as StockFilter);
              }}
            >
              <SelectTrigger
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[220px]")}
                aria-label="Filter by stock level"
              >
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="ALL">All levels</SelectItem>
                <SelectItem value="ok">In stock</SelectItem>
                <SelectItem value="attention">Needs attention (low &amp; out)</SelectItem>
                <SelectItem value="low">Low stock only</SelectItem>
                <SelectItem value="out">Out of stock only</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <DataTable
          loading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Failed to load inventory")}
          onRetry={() => void refetch()}
          retryLoading={isFetching}
          emptyDescription={
            hasActiveFilters
              ? "No ingredients match your filters."
              : "No inventory records for this branch yet."
          }
          hideBorders
          scroll={{ x: undefined }}
          columns={[
            {
              title: "Ingredient Name",
              key: "name",
              sorter: (a: InventoryRow, b: InventoryRow) =>
                ingredientDisplayName(a).localeCompare(ingredientDisplayName(b)),
              render: (_: unknown, record: InventoryRow) => (
                <span className={`font-medium ${text.primary}`}>
                  {ingredientDisplayName(record)}
                </span>
              ),
            },
            {
              title: "Stock Balance",
              key: "stock",
              sorter: (a: InventoryRow, b: InventoryRow) => a.stock - b.stock,
              render: (_: unknown, record: InventoryRow) => (
                <span className={cn("tabular-nums font-medium", text.primary)}>
                  {record.stock.toFixed(2)}
                </span>
              ),
            },
            {
              title: "Min Stock",
              key: "minStock",
              sorter: (a: InventoryRow, b: InventoryRow) => a.minStock - b.minStock,
              render: (_: unknown, record: InventoryRow) => (
                <span className={cn("tabular-nums", tableCellMutedClassName())}>
                  {record.minStock.toFixed(2)}
                </span>
              ),
            },
            {
              title: "Unit",
              key: "unit",
              render: (_: unknown, record: InventoryRow) => (
                <span className={tableCellMutedClassName()}>{record.ingredient?.unit ?? "—"}</span>
              ),
            },
            {
              title: "Status",
              key: "status",
              sorter: (a: InventoryRow, b: InventoryRow) => {
                const order = { out: 0, low: 1, ok: 2 };
                return (
                  order[stockLevel(a.stock, a.minStock)] -
                  order[stockLevel(b.stock, b.minStock)]
                );
              },
              render: (_: unknown, record: InventoryRow) => {
                const level = stockLevel(record.stock, record.minStock);
                const tone = stockLevelStatusTone(level);
                const label = stockLevelLabel(level);
                return (
                  <StatusBadge tone={tone} className="flex items-center gap-1 w-fit">
                    {level !== "ok" ? <AlertTriangle className="w-3 h-3" aria-hidden /> : null}
                    {label}
                  </StatusBadge>
                );
              },
            },
            {
              title: "Actions",
              key: "actions",
              width: 160,
              render: (_: unknown, record: InventoryRow) => {
                const level = stockLevel(record.stock, record.minStock);
                if (level === "ok") return null;
                return (
                  <div className="flex flex-wrap items-center gap-1">
                    <TableActionButton
                      label="View batches"
                      icon={ClipboardCheck}
                      tone="emerald"
                      onClick={() => router.push("/inventory/batches")}
                    />
                    {showGrnAction && (
                      <TableActionButton
                        label="Receive stock (GRN)"
                        icon={ArrowDownToLine}
                        tone="blue"
                        onClick={() => router.push("/inventory/stock-in")}
                      />
                    )}
                  </div>
                );
              },
            },
          ]}
          dataSource={filteredInventory}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
        />
        </div>

        <div className={inventorySectionPanelClassName()}>
          <StockTransfersPanel
            variant="compact"
            sourceInventories={transferSourceInventories}
          />
        </div>
      </div>
    </>
  );
}
