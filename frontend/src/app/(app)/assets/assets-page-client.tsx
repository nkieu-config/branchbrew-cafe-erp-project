"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  useCreateEquipment,
  useEquipment,
  useLogMaintenance,
} from "@/hooks/domains/useProcurementQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { RegisterEquipmentModal } from "@/components/assets/RegisterEquipmentModal";
import { LogMaintenanceModal } from "@/components/assets/LogMaintenanceModal";
import { EquipmentTable } from "@/components/assets/EquipmentTable";
import { Button } from "@/components/ui/button";
import {
  EQUIPMENT_TYPE_OPTIONS,
  type EquipmentHighlightFilter,
  type EquipmentStatusFilter,
  type EquipmentTypeFilter,
  filterEquipment,
  summarizeEquipment,
} from "@/lib/equipment-filters";
import { getErrorMessage } from "@/lib/errors";
import type { Branch, Equipment, EquipmentStatus, EquipmentType } from "@/types/api";
import { assetsSectionPanelClassName } from "@/lib/theme/assets";
import {
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
} from "@/lib/theme/hub-banners";
import { hubCtaClassName, hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { cn } from "@/lib/utils";

export default function AssetsPageClient() {
  const { user, activeBranchId } = useAuth();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((branch) => branch.id === branchIdNum)?.name;

  const {
    data: equipmentData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useEquipment(branchIdNum);
  const createMutation = useCreateEquipment();
  const maintMutation = useLogMaintenance();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [statusFilter, setStatusFilter] = useState<EquipmentStatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<EquipmentTypeFilter>("ALL");
  const [highlightFilter, setHighlightFilter] = useState<EquipmentHighlightFilter>("ALL");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState<Equipment | null>(null);

  const equipmentList = equipmentData ?? [];

  const summary = useMemo(() => summarizeEquipment(equipmentList), [equipmentList]);

  const filteredEquipment = useMemo(
    () =>
      filterEquipment(equipmentList, {
        statusFilter,
        typeFilter,
        highlightFilter,
        search: debouncedSearch,
      }),
    [equipmentList, statusFilter, typeFilter, highlightFilter, debouncedSearch],
  );

  const hasActiveFilters =
    search.trim().length > 0 ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    highlightFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setHighlightFilter("ALL");
  };

  const handleCreate = async (payload: {
    branchId: number;
    name: string;
    type: EquipmentType;
    serialNumber?: string;
    nextMaintenanceDate?: string;
  }) => {
    try {
      await createMutation.mutateAsync(payload);
      toast.success("Equipment registered");
      setRegisterOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to register equipment"));
      throw err;
    }
  };

  const handleLogMaintenance = async (payload: {
    id: number;
    data: {
      description: string;
      cost: number;
      performedBy?: string;
      date: string;
      nextMaintenanceDate?: string;
      newStatus?: EquipmentStatus;
    };
  }) => {
    try {
      await maintMutation.mutateAsync(payload);
      toast.success("Maintenance logged");
      setMaintenanceTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to log maintenance"));
      throw err;
    }
  };

  if (!branchIdNum) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to manage equipment." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        accentHub="assets"
        branchScope={{ branchName }}
        actions={
          <Button
            className={hubCtaClassName("assets", "min-h-[44px]")}
            onClick={() => setRegisterOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Register equipment
          </Button>
        }
      />

      <HubListPage className={assetsSectionPanelClassName()}>
        {!isLoading && !isError && summary.dueSoon > 0 && (
          <HubListPage.Banner>
            <div className={infoBannerClassName()}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>Maintenance attention needed</p>
                  <p className={infoBannerTextClassName()}>
                    {summary.dueSoon} active asset{summary.dueSoon === 1 ? " is" : "s are"} overdue
                    or due within 7 days. Schedule service to avoid downtime.
                  </p>
                </div>
              </div>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load equipment.") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, serial, type…"
          showReset={hasActiveFilters}
          onReset={resetFilters}
          filters={
            <>
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EquipmentStatusFilter)}
                ariaLabel="Filter by status"
                widthClassName="w-full sm:w-[160px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "MAINTENANCE", label: "In maintenance" },
                  { value: "BROKEN", label: "Broken" },
                  { value: "RETIRED", label: "Retired" },
                ]}
              />
              <ListFilterSelect
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as EquipmentTypeFilter)}
                ariaLabel="Filter by type"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All types" },
                  ...EQUIPMENT_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
              />
              <ListFilterSelect
                value={highlightFilter}
                onValueChange={(value) => setHighlightFilter(value as EquipmentHighlightFilter)}
                ariaLabel="Filter by maintenance schedule"
                widthClassName="w-full sm:w-[160px]"
                options={[
                  { value: "ALL", label: "All schedules" },
                  { value: "due-soon", label: "Due within 7 days" },
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
          filteredCount={filteredEquipment.length}
          totalCount={summary.total}
          itemLabel="asset"
          emptyLabel="No equipment yet"
        />

        <HubListPage.Body>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className={cn("w-8 h-8", hubLoadingSpinnerClassName())} aria-hidden />
              <span className="sr-only">Loading equipment</span>
            </div>
          ) : (
            <EquipmentTable
              equipment={filteredEquipment}
              loading={isLoading}
              hasActiveFilters={hasActiveFilters}
              onLogMaintenance={setMaintenanceTarget}
            />
          )}
        </HubListPage.Body>
      </HubListPage>

      <RegisterEquipmentModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        branchId={branchIdNum}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <LogMaintenanceModal
        open={maintenanceTarget != null}
        onClose={() => setMaintenanceTarget(null)}
        equipment={maintenanceTarget}
        performedBy={user?.name ?? user?.email ?? undefined}
        onSubmit={handleLogMaintenance}
        isSubmitting={maintMutation.isPending}
      />
    </div>
  );
}
