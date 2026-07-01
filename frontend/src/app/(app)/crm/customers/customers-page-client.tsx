"use client";

import { useMemo, useState } from "react";
import { useCustomers } from "@/hooks/domains/useCrmQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Customer360Sheet } from "@/components/crm/Customer360Sheet";
import { CustomerListTable } from "@/components/crm/CustomerListTable";
import { RegisterCustomerDialog } from "@/components/crm/RegisterCustomerDialog";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { getErrorMessage } from "@/lib/errors";
import type { Customer, Tier } from "@/types/api";
import { crmSectionPanelClassName } from "@/lib/theme/hub-crm";

type TierFilter = "ALL" | Tier;

export default function CustomersPageClient() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const {
    data: customersData,
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCustomers(debouncedSearch || undefined);
  const customers = customersData || [];

  const tierSummary = useMemo(() => {
    const counts = { platinum: 0, gold: 0, silver: 0, regular: 0 };
    for (const c of customers) {
      switch (c.tier?.toUpperCase()) {
        case "PLATINUM":
          counts.platinum += 1;
          break;
        case "GOLD":
          counts.gold += 1;
          break;
        case "SILVER":
          counts.silver += 1;
          break;
        default:
          counts.regular += 1;
      }
    }
    return { total: customers.length, ...counts };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (tierFilter === "ALL") return customers;
    return customers.filter((c: Customer) => c.tier === tierFilter);
  }, [customers, tierFilter]);

  const hasActiveFilters = search.trim().length > 0 || tierFilter !== "ALL";

  const openCustomerProfile = (id: number) => {
    setSelectedCustomerId(id);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <RegisterCustomerDialog />
      </div>

      <HubListPage className={crmSectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load customers") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name or phone…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setTierFilter("ALL");
          }}
          filters={
            <ListFilterSelect
              value={tierFilter}
              onValueChange={(value) => setTierFilter(value as TierFilter)}
              ariaLabel="Filter by tier"
              widthClassName="w-full sm:w-[180px]"
              options={[
                { value: "ALL", label: "All tiers" },
                { value: "PLATINUM", label: "Platinum" },
                { value: "GOLD", label: "Gold" },
                { value: "SILVER", label: "Silver" },
                { value: "REGULAR", label: "Regular" },
              ]}
            />
          }
        />

        <HubListPage.Count
          isLoading={loading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredCustomers.length}
          totalCount={tierSummary.total}
          itemLabel="member"
          emptyLabel="No members yet"
        />

        <CustomerListTable
          customers={filteredCustomers}
          loading={loading}
          isError={isError}
          hasActiveFilters={hasActiveFilters}
          onSelectCustomer={openCustomerProfile}
        />
      </HubListPage>

      <Customer360Sheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        customerId={selectedCustomerId}
      />
    </>
  );
}
