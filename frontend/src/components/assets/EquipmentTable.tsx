"use client";

import { memo, useCallback, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Wrench } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { StatusBadge, equipmentStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import {
  equipmentStatusLabel,
  equipmentTypeLabel,
  isMaintenanceDueSoon,
  isMaintenanceOverdue,
} from "@/lib/equipment-filters";
import { formatDate } from "@/lib/intl-date";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import {
  assetsMutedMetaClassName,
  equipmentMaintenanceDateClassName,
  equipmentMaintenanceDueRowClassName,
  equipmentMaintenanceOverdueRowClassName,
} from "@/lib/theme/assets";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Equipment, EquipmentStatus, EquipmentType } from "@/types/api";

type EquipmentTableProps = {
  equipment: Equipment[];
  loading: boolean;
  hasActiveFilters: boolean;
  onLogMaintenance: (equipment: Equipment) => void;
};

function equipmentRowHighlightClass(record: Equipment) {
  if (record.status !== "ACTIVE" || !record.nextMaintenanceDate) return undefined;
  if (isMaintenanceOverdue(record.nextMaintenanceDate)) {
    return equipmentMaintenanceOverdueRowClassName("cursor-default");
  }
  if (isMaintenanceDueSoon(record.nextMaintenanceDate)) {
    return equipmentMaintenanceDueRowClassName("cursor-default");
  }
  return undefined;
}

type EquipmentMobileCardProps = {
  record: Equipment;
  onLogMaintenance: (equipment: Equipment) => void;
};

const EquipmentMobileCard = memo(function EquipmentMobileCard({
  record,
  onLogMaintenance,
}: EquipmentMobileCardProps) {
  return (
    <ListMobileCard className={equipmentRowHighlightClass(record)}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("truncate font-medium", text.primary)}>{record.name}</p>
          {record.serialNumber ? (
            <p className={cn("truncate font-mono text-xs", tableCellMutedClassName())}>
              {record.serialNumber}
            </p>
          ) : null}
          <p className={cn("mt-1 text-sm", assetsMutedMetaClassName())}>
            {equipmentTypeLabel(record.type)}
          </p>
        </div>
        <StatusBadge tone={equipmentStatusTone(record.status)} className="shrink-0">
          {equipmentStatusLabel(record.status)}
        </StatusBadge>
      </div>
      <p className={cn("mb-3 text-sm", text.muted)}>
        Next maintenance{" "}
        {record.nextMaintenanceDate ? (
          <EquipmentMaintenanceDate date={record.nextMaintenanceDate} />
        ) : (
          <span>—</span>
        )}
      </p>
      <div className="flex justify-end">
        <TableActionButton
          label={`Log maintenance for ${record.name}`}
          icon={Wrench}
          iconOnly
          tone="amber"
          onClick={() => onLogMaintenance(record)}
        />
      </div>
    </ListMobileCard>
  );
});

function EquipmentMaintenanceDate({ date }: { date: string }) {
  const overdue = isMaintenanceOverdue(date);
  const dueSoon = isMaintenanceDueSoon(date);
  return (
    <span className={equipmentMaintenanceDateClassName(overdue, dueSoon)}>
      {formatDate(date)}
    </span>
  );
}

export function EquipmentTable({
  equipment,
  loading,
  hasActiveFilters,
  onLogMaintenance,
}: EquipmentTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No equipment matches your filters."
    : "Register your first asset to start tracking maintenance.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${equipment.length}-${hasActiveFilters}`,
  );

  const renderMaintenanceDate = useCallback((date: string | null | undefined) => {
    if (!date) {
      return <span className={text.muted}>—</span>;
    }
    const overdue = isMaintenanceOverdue(date);
    const dueSoon = isMaintenanceDueSoon(date);
    return (
      <span className={equipmentMaintenanceDateClassName(overdue, dueSoon)}>
        {formatDate(date)}
      </span>
    );
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: Equipment) => (
            <div className="min-w-0">
              <span className={cn("block truncate font-medium", text.primary)}>{name}</span>
              {record.serialNumber ? (
                <span className={cn("block truncate font-mono text-xs", tableCellMutedClassName())}>
                  {record.serialNumber}
                </span>
              ) : null}
            </div>
          ),
        },
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          responsive: ["md"],
          render: (type: EquipmentType) => (
            <span className={assetsMutedMetaClassName()}>{equipmentTypeLabel(type)}</span>
          ),
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
          title: "Maintenance",
          dataIndex: "nextMaintenanceDate",
          key: "nextMaintenanceDate",
          responsive: ["sm"],
          render: (date: string | null | undefined) => renderMaintenanceDate(date),
        },
        {
          title: "",
          key: "actions",
          width: 56,
          align: "right" as const,
          render: (_: unknown, record: Equipment) => (
            <TableActionButton
              label={`Log maintenance for ${record.name}`}
              icon={Wrench}
              iconOnly
              tone="amber"
              onClick={() => onLogMaintenance(record)}
            />
          ),
        },
      ] satisfies ColumnsType<Equipment>,
    [onLogMaintenance, renderMaintenanceDate],
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

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : equipment.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={equipment}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => (
              <EquipmentMobileCard record={record} onLogMaintenance={onLogMaintenance} />
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={loading}
          columns={columns}
          dataSource={equipment}
          rowKey="id"
          rowClassName={rowClassName}
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
