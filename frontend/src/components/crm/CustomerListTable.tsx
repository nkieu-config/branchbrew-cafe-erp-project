"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TierIcon } from "@/components/crm/TierIcon";
import { formatDate } from "@/lib/intl-date";
import type { Customer } from "@/types/api";
import {
  crmPointsClassName,
  crmPointsSuffixClassName,
  customerTierTone,
} from "@/lib/theme/hub-crm";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type CustomerListTableProps = {
  customers: Customer[];
  loading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onSelectCustomer: (id: number) => void;
};

export function CustomerListTable({
  customers,
  loading,
  isError,
  hasActiveFilters,
  onSelectCustomer,
}: CustomerListTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Customer",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={typeUiLabelClassName(cn("text-md", text.primary))}>{name}</span>
          ),
        },
        {
          title: "Phone",
          dataIndex: "phone",
          key: "phone",
          responsive: ["md"],
          render: (phone: string) => (
            <span className={cn("font-mono font-medium", text.muted)}>{phone}</span>
          ),
        },
        {
          title: "Tier",
          key: "tier",
          render: (_: unknown, record: Customer) => (
            <StatusBadge
              tone={customerTierTone(record.tier)}
              className={typeHeadingClassName(
                "flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider rounded-lg",
              )}
            >
              <TierIcon tier={record.tier} />
              {record.tier}
            </StatusBadge>
          ),
        },
        {
          title: "Points",
          dataIndex: "points",
          key: "points",
          render: (points: number) => (
            <span className={crmPointsClassName()}>
              {points.toLocaleString()}{" "}
              <span className={crmPointsSuffixClassName()}>pts</span>
            </span>
          ),
        },
        {
          title: "Joined",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt: string) => (
            <span className={cn("font-medium text-sm", text.muted)}>
              {formatDate(createdAt)}
            </span>
          ),
        },
      ] as ColumnsType<Customer>,
    [],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={loading && !isError}
      columns={columns}
      dataSource={customers}
      rowKey="id"
      emptyDescription={
        hasActiveFilters ? "No members match your filters." : "No members registered yet."
      }
      onRow={(record) => ({
        onClick: () => onSelectCustomer(record.id),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectCustomer(record.id);
          }
        },
        tabIndex: 0,
        role: "button",
        "aria-label": `View profile for ${record.name}`,
        className:
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      })}
    />
  );
}
