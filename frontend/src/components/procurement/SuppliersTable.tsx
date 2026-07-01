"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { buildProcurementOrdersUrl } from "@/lib/procurement-hub-url";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
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

type SupplierRowActionsProps = {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
};

function SupplierRowActions({ supplier, onEdit, onDelete }: SupplierRowActionsProps) {
  return (
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
  );
}

type SupplierMobileCardProps = SupplierRowActionsProps & {
  poCount: number;
};

function SupplierMobileCard({ supplier, poCount, onEdit, onDelete }: SupplierMobileCardProps) {
  return (
    <ListMobileCard>
      <p className={cn("mb-2 font-medium", text.primary)}>{supplier.name}</p>
      {supplier.contactEmail ? (
        <p className={cn("text-sm", text.secondary)}>{supplier.contactEmail}</p>
      ) : null}
      {supplier.phone ? (
        <p className={cn("text-sm tabular-nums", text.secondary)}>{supplier.phone}</p>
      ) : null}
      {poCount > 0 ? (
        <p className={cn("mt-2 text-sm", text.muted)}>
          <Link
            href={buildProcurementOrdersUrl({ supplier: supplier.id })}
            className={inlineLinkClassName()}
          >
            {poCount} purchase order{poCount === 1 ? "" : "s"}
          </Link>
        </p>
      ) : null}
      <div className="mt-3">
        <SupplierRowActions supplier={supplier} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </ListMobileCard>
  );
}

export function SuppliersTable({
  suppliers,
  loading,
  hasActiveFilters,
  poCountBySupplier,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No suppliers match your filters."
    : "No suppliers yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${suppliers.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (value: string) => (
            <span className={cn("font-medium", text.primary)}>{value}</span>
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
              <span className={cn("tabular-nums", text.secondary)}>{value}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "POs",
          key: "poCount",
          width: 72,
          responsive: ["lg"],
          render: (_: unknown, supplier: Supplier) => {
            const count = poCountBySupplier.get(supplier.id) ?? 0;
            return count > 0 ? (
              <Link
                href={buildProcurementOrdersUrl({ supplier: supplier.id })}
                className={inlineLinkClassName("tabular-nums text-sm")}
              >
                {count}
              </Link>
            ) : (
              <span className={text.muted}>—</span>
            );
          },
        },
        {
          title: "",
          key: "actions",
          width: 80,
          align: "right" as const,
          render: (_: unknown, supplier: Supplier) => (
            <SupplierRowActions supplier={supplier} onEdit={onEdit} onDelete={onDelete} />
          ),
        },
      ] as ColumnsType<Supplier>,
    [onDelete, onEdit, poCountBySupplier],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : suppliers.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={suppliers}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(supplier) => (
              <SupplierMobileCard
                supplier={supplier}
                poCount={poCountBySupplier.get(supplier.id) ?? 0}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={loading}
          emptyDescription={emptyDescription}
          rowKey="id"
          dataSource={suppliers}
          columns={columns}
        />
      }
    />
  );
}
