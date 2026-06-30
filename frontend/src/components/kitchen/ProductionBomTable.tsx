"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/money";
import { buildProductsCostingUrl, buildProductsIngredientsUrl } from "@/lib/products-hub-url";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { BomGroupRow, BomTableRow } from "@/types/api";

type ProductionBomTableProps = {
  groups: BomGroupRow[];
  loading: boolean;
};

export function ProductionBomTable({ groups, loading }: ProductionBomTableProps) {
  const columns: ColumnsType<BomTableRow> = useMemo(
    () => [
      {
        title: "Target / Raw Ingredient",
        dataIndex: "targetName",
        key: "name",
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            return (
              <span className={typeHeadingClassName("text-base")}>{record.targetName}</span>
            );
          }
          return <span className={cn(text.secondary, "pl-4")}>{record.rawName}</span>;
        },
      },
      {
        title: "Quantity Needed",
        key: "quantity",
        responsive: ["sm"],
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            return (
              <span className={cn("text-xs uppercase tracking-wider", text.muted)}>
                Per 1 {record.targetUnit}
              </span>
            );
          }
          return (
            <span className="font-mono font-medium tabular-nums">
              {record.quantityNeeded} {record.rawUnit}
            </span>
          );
        },
      },
      {
        title: "Est. Cost",
        key: "cost",
        align: "right" as const,
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            const total = record.children.reduce((sum, c) => sum + c.totalCost, 0);
            const hasMissingCost = record.children.some((c) => c.costPerUnit <= 0);
            return (
              <div className="flex flex-col items-end gap-1">
                <span
                  className={typeHeadingClassName(cn("tabular-nums", metricValueClassName("red")))}
                >
                  {formatCurrency(total)}
                </span>
                {hasMissingCost && (
                  <Link
                    href={buildProductsIngredientsUrl({ cost: "missing-cost" })}
                    className={cn("text-xs", inlineLinkClassName())}
                  >
                    Missing cost lines
                  </Link>
                )}
              </div>
            );
          }
          return (
            <span className={cn(text.subtle, "tabular-nums")}>{formatCurrency(record.totalCost)}</span>
          );
        },
      },
      {
        title: "Food Cost",
        key: "foodcost",
        responsive: ["md"],
        render: (_: unknown, record) => {
          if ("isGroup" in record && record.isGroup) {
            return (
              <Link href={buildProductsCostingUrl()} className={inlineLinkClassName()}>
                View in Food Cost
              </Link>
            );
          }
          return null;
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      columns={columns}
      dataSource={groups}
      rowKey="id"
      loading={loading}
      pagination={false}
      defaultExpandAllRows
    />
  );
}
