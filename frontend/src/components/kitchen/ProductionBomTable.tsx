"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { formatCurrency } from "@/lib/money";
import { buildProductsIngredientsUrl } from "@/lib/products-hub-url";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { kitchenMutedMetaClassName } from "@/lib/theme/hub-kitchen";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { BomGroupRow, BomTableRow } from "@/types/api";

type ProductionBomTableProps = {
  groups: BomGroupRow[];
  loading: boolean;
};

export function ProductionBomTable({ groups, loading }: ProductionBomTableProps) {
  const emptyDescription = "No production BOM recipes yet.";

  const columns: ColumnsType<BomTableRow> = useMemo(
    () => [
      {
        title: "Ingredient",
        dataIndex: "targetName",
        key: "name",
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            return <span className={cn("font-medium", text.primary)}>{record.targetName}</span>;
          }
          return <span className={cn(text.secondary, "pl-4")}>{record.rawName}</span>;
        },
      },
      {
        title: "Qty",
        key: "quantity",
        width: 120,
        responsive: ["sm"],
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            return (
              <span className={kitchenMutedMetaClassName()}>per 1 {record.targetUnit}</span>
            );
          }
          return (
            <span className={cn("tabular-nums", text.secondary)}>
              {record.quantityNeeded} {record.rawUnit}
            </span>
          );
        },
      },
      {
        title: "Cost",
        key: "cost",
        align: "right" as const,
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            const total = record.children.reduce((sum, c) => sum + c.totalCost, 0);
            const hasMissingCost = record.children.some((c) => c.costPerUnit <= 0);
            return (
              <div className="flex flex-col items-end gap-0.5">
                <span className={cn("tabular-nums font-medium", text.primary)}>
                  {formatCurrency(total)}
                </span>
                {hasMissingCost && (
                  <Link
                    href={buildProductsIngredientsUrl({ cost: "missing-cost" })}
                    className={kitchenMutedMetaClassName(inlineLinkClassName())}
                  >
                    missing cost
                  </Link>
                )}
              </div>
            );
          }
          return (
            <span className={cn("tabular-nums", text.muted)}>{formatCurrency(record.totalCost)}</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : groups.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList items={groups} pageSize={0}>
            {(group) => {
              const total = group.children.reduce((sum, c) => sum + c.totalCost, 0);
              const hasMissingCost = group.children.some((c) => c.costPerUnit <= 0);

              return (
                <ListMobileCard>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("font-medium", text.primary)}>{group.targetName}</p>
                      <p className={kitchenMutedMetaClassName()}>per 1 {group.targetUnit}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("tabular-nums font-medium", text.primary)}>
                        {formatCurrency(total)}
                      </p>
                      {hasMissingCost ? (
                        <Link
                          href={buildProductsIngredientsUrl({ cost: "missing-cost" })}
                          className={kitchenMutedMetaClassName(inlineLinkClassName("text-xs"))}
                        >
                          missing cost
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {group.children.length > 0 ? (
                    <ul className="space-y-2 border-t border-[var(--table-row-border)] pt-2 text-sm">
                      {group.children.map((child) => (
                        <li
                          key={child.id}
                          className="flex items-baseline justify-between gap-3 border-b border-[var(--table-row-border)] pb-2 last:border-0 last:pb-0"
                        >
                          <span className={text.secondary}>{child.rawName}</span>
                          <span className={cn("shrink-0 tabular-nums text-right", text.muted)}>
                            {child.quantityNeeded} {child.rawUnit}
                            <span className={cn("ml-2", text.primary)}>
                              {formatCurrency(child.totalCost)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={cn("text-sm", text.muted)}>No ingredients in recipe.</p>
                  )}
                </ListMobileCard>
              );
            }}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          {...hubListDataTableProps()}
          columns={columns}
          dataSource={groups}
          rowKey="id"
          loading={loading}
          pagination={false}
          defaultExpandAllRows
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
