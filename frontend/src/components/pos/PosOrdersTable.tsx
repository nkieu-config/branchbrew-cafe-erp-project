"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Ban, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, orderStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { formatBaht } from "@/lib/money";
import { formatQueueNumber } from "@/lib/queue";
import { isOrderToday, isTerminalOrderStatus } from "@/lib/pos-order-filters";
import { formatDateTime } from "@/lib/intl-date";
import { tableRowDividerClassName } from "@/lib/theme/color-helpers";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { posQueueHighlightClassName } from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/api";

type PosOrdersTableProps = {
  orders: Order[];
  loading: boolean;
  hasActiveFilters: boolean;
  canManage: boolean;
  onVoid: (order: Order) => void;
  onRefund: (order: Order) => void;
};

export function PosOrdersTable({
  orders,
  loading,
  hasActiveFilters,
  canManage,
  onVoid,
  onRefund,
}: PosOrdersTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Queue",
          dataIndex: "queueNumber",
          key: "queue",
          render: (n: number | null) => (
            <span className={posQueueHighlightClassName()}>{formatQueueNumber(n)}</span>
          ),
        },
        {
          title: "Order #",
          dataIndex: "id",
          key: "id",
          render: (id: number) => (
            <span className={cn("font-mono", tableCellMutedClassName())}>#{id}</span>
          ),
        },
        {
          title: "Date",
          dataIndex: "createdAt",
          key: "date",
          render: (v: string) => formatDateTime(v),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: OrderStatus) => (
            <StatusBadge tone={orderStatusTone(status)}>{status}</StatusBadge>
          ),
        },
        {
          title: "Payment",
          dataIndex: "paymentMethod",
          key: "payment",
          render: (v: string) => v?.replace("_", " ") ?? "-",
        },
        {
          title: "Net",
          dataIndex: "netAmount",
          key: "net",
          align: "right" as const,
          render: (v: number | string) => (
            <span className={typeHeadingClassName("font-mono tabular-nums")}>
              {formatBaht(v)}
            </span>
          ),
        },
        {
          title: "Items",
          key: "items",
          render: (_: unknown, row: Order) => row.items?.length ?? 0,
        },
        {
          title: "Actions",
          key: "actions",
          align: "right" as const,
          render: (_: unknown, row: Order) => {
            if (!canManage || isTerminalOrderStatus(row.status)) return null;

            if (isOrderToday(row.createdAt)) {
              return (
                <TableActionButton
                  icon={Ban}
                  label="Void"
                  destructive
                  onClick={() => onVoid(row)}
                />
              );
            }

            if (row.status === "COMPLETED") {
              return (
                <TableActionButton
                  icon={RotateCcw}
                  label="Refund"
                  tone="amber"
                  onClick={() => onRefund(row)}
                />
              );
            }

            return null;
          },
        },
      ] satisfies ColumnsType<Order>,
    [canManage, onVoid, onRefund],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={loading}
      rowKey="id"
      dataSource={orders}
      columns={columns}
      emptyDescription={
        hasActiveFilters
          ? "No orders match your filters."
          : "No orders in the last 14 days."
      }
      expandable={{
        expandedRowRender: (row: Order) => (
          <ul className="py-2 space-y-2 text-sm">
            {(row.items ?? []).map((item) => (
              <li
                key={item.id}
                className={tableRowDividerClassName(
                  "flex flex-wrap items-baseline justify-between gap-2 border-b pb-2 last:border-0",
                )}
              >
                <div>
                  <span className={text.primary}>
                    {item.product?.name ?? `Product #${item.productId}`}
                  </span>
                  {item.notes && (
                    <span className={cn("block text-xs", text.muted)}>{item.notes}</span>
                  )}
                  {item.modifiers?.map((mod) => (
                    <span key={mod.id} className={cn("block text-xs", text.muted)}>
                      {mod.optionName}
                    </span>
                  ))}
                </div>
                <span className="font-mono tabular-nums shrink-0">
                  {item.quantity} × {formatBaht(item.price)}
                </span>
              </li>
            ))}
            {(row.items?.length ?? 0) === 0 && (
              <li className={text.muted}>No line items returned for this order.</li>
            )}
          </ul>
        ),
        rowExpandable: (row) => (row.items?.length ?? 0) > 0,
      }}
    />
  );
}
