"use client";

import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { AlertTriangle, Loader2, Plus, Wrench } from "lucide-react";
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
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge, equipmentStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { RegisterEquipmentModal } from "@/components/assets/RegisterEquipmentModal";
import { LogMaintenanceModal } from "@/components/assets/LogMaintenanceModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EQUIPMENT_TYPE_OPTIONS,
  type EquipmentHighlightFilter,
  type EquipmentStatusFilter,
  type EquipmentTypeFilter,
  equipmentStatusLabel,
  equipmentTypeLabel,
  filterEquipment,
  isMaintenanceDueSoon,
  isMaintenanceOverdue,
  summarizeEquipment,
} from "@/lib/equipment-filters";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/intl-date";
import type { Branch, Equipment, EquipmentStatus, EquipmentType } from "@/types/api";
import {
  assetsSectionPanelClassName,
  assetsSummaryChipClassName,
  equipmentLegendSwatchClassName,
  equipmentMaintenanceDateClassName,
  equipmentMaintenanceDueRowClassName,
  equipmentMaintenanceOverdueRowClassName,
  formSelectContentClassName,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AssetsPage() {
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

  const toggleStatusFilter = (next: EquipmentStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const toggleHighlightFilter = () => {
    setHighlightFilter((current) => (current === "due-soon" ? "ALL" : "due-soon"));
  };

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

  const columns = useMemo(
    () =>
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: Equipment) => (
            <div className="min-w-0">
              <span className={cn("font-medium block truncate", text.primary)}>{name}</span>
              {record.serialNumber && (
                <span className={cn("text-xs block truncate", tableCellMutedClassName())}>
                  S/N {record.serialNumber}
                </span>
              )}
            </div>
          ),
        },
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          render: (type: EquipmentType) => equipmentTypeLabel(type),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: EquipmentStatus) => (
            <StatusBadge tone={equipmentStatusTone(status)}>
              {equipmentStatusLabel(status)}
            </StatusBadge>
          ),
        },
        {
          title: "Next maintenance",
          dataIndex: "nextMaintenanceDate",
          key: "nextMaintenanceDate",
          render: (date: string | null | undefined) => {
            if (!date) {
              return <span className={tableCellMutedClassName()}>—</span>;
            }
            const overdue = isMaintenanceOverdue(date);
            const dueSoon = isMaintenanceDueSoon(date);
            return (
              <span className={equipmentMaintenanceDateClassName(overdue, dueSoon)}>
                {formatDate(date)}
                {overdue && " · overdue"}
                {!overdue && dueSoon && " · due soon"}
              </span>
            );
          },
        },
        {
          title: "Actions",
          key: "actions",
          width: 120,
          render: (_: unknown, record: Equipment) => (
            <TableActionButton
              label="Log maintenance"
              icon={Wrench}
              tone="amber"
              onClick={() => setMaintenanceTarget(record)}
            />
          ),
        },
      ] satisfies ColumnsType<Equipment>,
    [],
  );

  const rowClassName = (record: Equipment) => {
    if (record.status !== "ACTIVE" || !record.nextMaintenanceDate) return "";
    if (isMaintenanceOverdue(record.nextMaintenanceDate)) {
      return equipmentMaintenanceOverdueRowClassName();
    }
    if (isMaintenanceDueSoon(record.nextMaintenanceDate)) {
      return equipmentMaintenanceDueRowClassName();
    }
    return "";
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
        description="Track machines, appliances, and schedule preventative maintenance."
        actions={
          <Button
            className={hubCtaClassName("assets", "font-bold min-h-[44px]")}
            onClick={() => setRegisterOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Register equipment
          </Button>
        }
      />

      <div className={assetsSectionPanelClassName()}>
        {!isLoading && !isError && summary.dueSoon > 0 && (
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
        )}

        {!isLoading && !isError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total > 0
                ? `${summary.total} asset${summary.total === 1 ? "" : "s"}`
                : "No equipment yet"}
            </span>
            {summary.active > 0 && (
              <button
                type="button"
                className={assetsSummaryChipClassName(
                  statusFilter === "ACTIVE",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("ACTIVE")}
              >
                {summary.active} active
              </button>
            )}
            {summary.maintenance > 0 && (
              <button
                type="button"
                className={assetsSummaryChipClassName(
                  statusFilter === "MAINTENANCE",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleStatusFilter("MAINTENANCE")}
              >
                {summary.maintenance} in service
              </button>
            )}
            {summary.broken > 0 && (
              <button
                type="button"
                className={assetsSummaryChipClassName(
                  statusFilter === "BROKEN",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleStatusFilter("BROKEN")}
              >
                {summary.broken} broken
              </button>
            )}
            {summary.dueSoon > 0 && (
              <button
                type="button"
                className={assetsSummaryChipClassName(
                  highlightFilter === "due-soon",
                  metricValueClassName("amber"),
                )}
                onClick={toggleHighlightFilter}
              >
                {summary.dueSoon} due soon
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && summary.total > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-subtle)]">
            <span className="font-medium uppercase tracking-wide">Legend</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={equipmentLegendSwatchClassName("active")} aria-hidden />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={equipmentLegendSwatchClassName("maintenance")} aria-hidden />
              In maintenance
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={equipmentLegendSwatchClassName("broken")} aria-hidden />
              Broken
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={equipmentLegendSwatchClassName("due-soon")} aria-hidden />
              Due within 7 days
            </span>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load equipment.")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, serial, type…"
          branchName={branchName}
          showReset={hasActiveFilters}
          onReset={resetFilters}
          filters={
            <>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  value && setStatusFilter(value as EquipmentStatusFilter)
                }
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[160px]")}
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">In maintenance</SelectItem>
                  <SelectItem value="BROKEN">Broken</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  value && setTypeFilter(value as EquipmentTypeFilter)
                }
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[180px]")}
                  aria-label="Filter by type"
                >
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All types</SelectItem>
                  {EQUIPMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className={cn("w-8 h-8", hubLoadingSpinnerClassName())} aria-hidden />
            <span className="sr-only">Loading equipment</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            dataSource={filteredEquipment}
            rowKey="id"
            rowClassName={rowClassName}
            emptyDescription={
              hasActiveFilters
                ? "No equipment matches your filters."
                : "Register your first asset to start tracking maintenance."
            }
          />
        )}
      </div>

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
