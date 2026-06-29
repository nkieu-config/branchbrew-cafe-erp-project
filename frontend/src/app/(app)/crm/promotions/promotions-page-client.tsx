"use client";

import { useMemo, useState } from "react";
import { TicketPercent, Plus, Users } from "lucide-react";
import { usePromotions } from "@/hooks/domains/useCrmQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DeletePromotionDialog } from "@/components/crm/DeletePromotionDialog";
import { PromotionFormDialog } from "@/components/crm/PromotionFormDialog";
import { PromotionListTable } from "@/components/crm/PromotionListTable";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { HubPageHeader } from "@/components/shared/hub-card";
import { getErrorMessage } from "@/lib/errors";
import {
  getPromoValidity,
  type PromoDiscountFilter,
  type PromoStatusFilter,
} from "@/lib/promotion-status";
import type { Promotion } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { crmSectionPanelClassName } from "@/lib/theme/hub-crm";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";

export default function PromotionsPageClient() {
  const {
    data: promotionsData,
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePromotions();
  const promotions = promotionsData || [];

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<PromoStatusFilter>("ALL");
  const [discountFilter, setDiscountFilter] = useState<PromoDiscountFilter>("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const summary = useMemo(() => {
    const counts = { active: 0, inactive: 0, expired: 0, scheduled: 0 };
    for (const p of promotions) {
      counts[getPromoValidity(p)] += 1;
    }
    return { total: promotions.length, ...counts };
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p: Promotion) => {
      const haystack = [p.code, p.description].join(" ").toLowerCase();
      const matchesSearch = !debouncedSearch || haystack.includes(debouncedSearch);
      const validity = getPromoValidity(p);
      const matchesStatus = statusFilter === "ALL" || validity === statusFilter;
      const matchesDiscount = discountFilter === "ALL" || p.discountType === discountFilter;
      return matchesSearch && matchesStatus && matchesDiscount;
    });
  }, [promotions, debouncedSearch, statusFilter, discountFilter]);

  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== "ALL" || discountFilter !== "ALL";

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditing(promotion);
    setDialogOpen(true);
  };

  return (
    <>
      <HubPageHeader
        hideTitle
        icon={TicketPercent}
        accentHub="crm"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/crm/customers" variant="outline" className="font-medium">
              <Users className="w-4 h-4 mr-2" aria-hidden />
              View customers
            </ButtonLink>
            <Button className={hubCtaClassName("crm")} onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              New Promo Code
            </Button>
          </div>
        }
      />

      <HubListPage className={crmSectionPanelClassName()}>
        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load promotions") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by code or description…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setStatusFilter("ALL");
            setDiscountFilter("ALL");
          }}
          filters={
            <>
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as PromoStatusFilter)}
                ariaLabel="Filter by status"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "expired", label: "Expired" },
                  { value: "scheduled", label: "Scheduled" },
                ]}
              />
              <ListFilterSelect
                value={discountFilter}
                onValueChange={(value) => setDiscountFilter(value as PromoDiscountFilter)}
                ariaLabel="Filter by discount type"
                widthClassName="w-full sm:w-[200px]"
                options={[
                  { value: "ALL", label: "All discount types" },
                  { value: "PERCENTAGE", label: "Percentage" },
                  { value: "FIXED_AMOUNT", label: "Fixed amount" },
                ]}
              />
            </>
          }
        />

        <HubListPage.Count
          isLoading={loading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredPromotions.length}
          totalCount={summary.total}
          itemLabel="promo code"
          itemLabelPlural="promo codes"
          emptyLabel="No promotion codes yet"
        />

        <PromotionListTable
          promotions={filteredPromotions}
          loading={loading}
          isError={isError}
          hasActiveFilters={hasActiveFilters}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      </HubListPage>

      <PromotionFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        promotion={editing}
      />

      <DeletePromotionDialog
        promotion={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </>
  );
}
