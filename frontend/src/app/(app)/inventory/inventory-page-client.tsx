"use client";

import { useMemo, useState, useEffect, useDeferredValue } from "react";
import { useSearchParams } from "next/navigation";
import { useBranchInventory } from "@/hooks/domains/useInventoryQueries";
import { useAuth } from "@/context/AuthContext";
import { ArrowDownToLine } from "lucide-react";
import { InventoryOverviewTable } from "@/components/inventory/InventoryOverviewTable";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { getErrorMessage } from "@/lib/errors";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { inventorySectionPanelClassName, stockLevel } from "@/lib/theme/stock";

import type { BranchInventory, Role } from "@/types/api";

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

export default function InventoryPageClient() {
  const { activeBranchId, user } = useAuth();
  const role = user?.role as Role | undefined;
  const showGrnAction = canReceiveStock(role);
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
  const inventoryFilterParam = searchParams.get("filter");
  const attentionFromUrl = inventoryFilterParam === "low";
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [stockFilter, setStockFilter] = useState<StockFilter>(
    attentionFromUrl ? "attention" : "ALL",
  );

  useEffect(() => {
    if (inventoryFilterParam === "low") setStockFilter("attention");
  }, [inventoryFilterParam]);

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
      const matchesSearch = !deferredSearch || name.includes(deferredSearch);
      return matchesLevel && matchesSearch;
    });
  }, [inventory, deferredSearch, stockFilter]);

  const hasActiveFilters = search.trim().length > 0 || stockFilter !== "ALL";

  if (!activeBranchId) {
    return <BranchEmptyState description="Select a branch in the top bar to view stock balances." />;
  }

  return (
    <div className="space-y-5">
      {showGrnAction && (
        <div className="flex justify-end">
          <ButtonLink href="/inventory/stock-in" className={hubCtaClassName("inventory")}>
            <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden />
            Receive stock
          </ButtonLink>
        </div>
      )}

      <HubListPage className={inventorySectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load inventory") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ingredients…"
          searchTestId="inventory-search"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStockFilter("ALL");
          }}
          filters={
            <ListFilterSelect
              value={stockFilter}
              onValueChange={(value) => setStockFilter(value as StockFilter)}
              ariaLabel="Filter by stock level"
              widthClassName="w-full sm:w-[220px]"
              options={[
                { value: "ALL", label: "All levels" },
                { value: "ok", label: "In stock" },
                { value: "attention", label: "Needs attention (low & out)" },
                { value: "low", label: "Low stock only" },
                { value: "out", label: "Out of stock only" },
              ]}
            />
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredInventory.length}
          totalCount={stockSummary.total}
          itemLabel="ingredient"
          emptyLabel="No inventory records yet"
        />

        <InventoryOverviewTable
          rows={filteredInventory}
          loading={isLoading}
          hasActiveFilters={hasActiveFilters}
          showGrnAction={showGrnAction}
          ingredientDisplayName={ingredientDisplayName}
        />
      </HubListPage>
    </div>
  );
}
