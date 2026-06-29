"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { formatDate } from "@/lib/intl-date";
import { buildProcurementOrdersUrl } from "@/lib/procurement-hub-url";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/api";

type SuppliersTableProps = {
  suppliers: Supplier[];
  loading: boolean;
  hasActiveFilters: boolean;
  poCountBySupplier: Map<number, number>;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
};

export function SuppliersTable({
  suppliers,
  loading,
  hasActiveFilters,
  poCountBySupplier,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (value: string) => (
            <span className={typeHeadingClassName()}>{value}</span>
          ),
        },
        {
          title: "Email",
          dataIndex: "contactEmail",
          key: "email",
          responsive: ["md"],
          render: (value?: string | null) =>
            value ? (
              <span className={text.secondary}>{value}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Phone",
          dataIndex: "phone",
          key: "phone",
          responsive: ["md"],
          render: (value?: string | null) =>
            value ? (
              <span className={text.secondary}>{value}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "POs",
          key: "poCount",
          responsive: ["lg"],
          render: (_: unknown, supplier: Supplier) => {
            const count = poCountBySupplier.get(supplier.id) ?? 0;
            return count > 0 ? (
              <Link
                href={buildProcurementOrdersUrl({ supplier: supplier.id })}
                className={inlineLinkClassName("tabular-nums")}
              >
                {count} order{count === 1 ? "" : "s"}
              </Link>
            ) : (
              <span className={tableCellMutedClassName()}>—</span>
            );
          },
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt?: string) => (
            <span className={cn("text-sm font-medium", text.muted)}>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>
          ),
        },
        {
          title: "",
          key: "actions",
          width: 96,
          align: "right" as const,
          render: (_: unknown, supplier: Supplier) => (
            <div className="flex justify-end gap-1">
              <TableActionButton
                icon={Pencil}
                label={`Edit ${supplier.name}`}
                iconOnly
                tone="purple"
                onClick={() => onEdit(supplier)}
              />
              <TableActionButton
                icon={Trash2}
                label={`Delete ${supplier.name}`}
                iconOnly
                destructive
                onClick={() => onDelete(supplier)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Supplier>,
    [onEdit, onDelete, poCountBySupplier],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={loading}
      emptyDescription={
        hasActiveFilters
          ? "No suppliers match your filters."
          : "No suppliers yet. Add vendors to create purchase orders."
      }
      rowKey="id"
      dataSource={suppliers}
      columns={columns}
    />
  );
}
