"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Wrench } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, equipmentStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import {
  equipmentStatusLabel,
  equipmentTypeLabel,
  isMaintenanceDueSoon,
  isMaintenanceOverdue,
} from "@/lib/equipment-filters";
import { formatDate } from "@/lib/intl-date";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import {
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

export function EquipmentTable({
  equipment,
  loading,
  hasActiveFilters,
  onLogMaintenance,
}: EquipmentTableProps) {
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
              onClick={() => onLogMaintenance(record)}
            />
          ),
        },
      ] satisfies ColumnsType<Equipment>,
    [onLogMaintenance],
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
    <DataTable
      {...hubListDataTableProps()}
      loading={loading}
      columns={columns}
      dataSource={equipment}
      rowKey="id"
      rowClassName={rowClassName}
      emptyDescription={
        hasActiveFilters
          ? "No equipment matches your filters."
          : "Register your first asset to start tracking maintenance."
      }
    />
  );
}
