"use client";

import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { BatchInventoryTable } from "@/components/inventory/BatchInventoryTable";
import { getErrorMessage } from "@/lib/errors";
import { formatHubListCountWithFetching } from "@/lib/format-hub-list-count";
import type { ExpiryFilter, InventoryWithIngredient, BatchWithSupplier } from "@/lib/batch-filters";
import { inventorySectionPanelClassName } from "@/lib/theme/stock";
import { cn } from "@/lib/utils";

type BatchSummary = {
  total: number;
  expiring: number;
  expired: number;
};

type BatchInventoryPanelProps = {
  inventories: InventoryWithIngredient[];
  filteredInventories: InventoryWithIngredient[];
  batches: BatchWithSupplier[];
  batchSummary: BatchSummary;
  search: string;
  onSearchChange: (value: string) => void;
  expiryFilter: ExpiryFilter;
  onExpiryFilterChange: (value: ExpiryFilter) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  loading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  onRefetch: () => void;
  onReportWaste: (
    batchId: number,
    ingredientId: number,
    maxQty: number,
    ingredientName: string,
  ) => void;
};

export function BatchInventoryPanel({
  inventories,
  filteredInventories,
  batches,
  batchSummary,
  search,
  onSearchChange,
  expiryFilter,
  onExpiryFilterChange,
  hasActiveFilters,
  onResetFilters,
  loading,
  isError,
  error,
  isFetching,
  onRefetch,
  onReportWaste,
}: BatchInventoryPanelProps) {
  return (
    <HubListPage className={cn("lg:col-span-2", inventorySectionPanelClassName())}>
      <HubListPage.Error
        message={isError ? getErrorMessage(error, "Failed to load inventory") : undefined}
        onRetry={onRefetch}
        loading={isFetching}
      />

      <HubListPage.Toolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search ingredients…"
        showReset={hasActiveFilters}
        onReset={onResetFilters}
        filters={
          <ListFilterSelect
            value={expiryFilter}
            onValueChange={(value) => onExpiryFilterChange(value as ExpiryFilter)}
            ariaLabel="Filter by expiry"
            widthClassName="w-full sm:w-[220px]"
            options={[
              { value: "ALL", label: "All batches" },
              { value: "expiring", label: "Expiring within 7 days" },
              { value: "expired", label: "Expired only" },
            ]}
          />
        }
      />

      <HubListPage.Count
        isLoading={loading}
        isError={isError}
        isFetching={isFetching}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredInventories.length}
        totalCount={inventories.length}
        itemLabel="ingredient"
      >
        {!hasActiveFilters
          ? formatHubListCountWithFetching(
              batchSummary.total === 0
                ? "No batches yet"
                : `${batchSummary.total} batch${batchSummary.total === 1 ? "" : "es"}${batchSummary.expiring + batchSummary.expired > 0 ? ` · ${batchSummary.expiring} expiring · ${batchSummary.expired} expired` : ""}`,
              isFetching,
              loading,
            )
          : undefined}
      </HubListPage.Count>

      <BatchInventoryTable
        inventories={filteredInventories}
        batches={batches}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onReportWaste={onReportWaste}
      />
    </HubListPage>
  );
}
