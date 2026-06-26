"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBranchOrders, useVoidOrder } from "@/hooks/domains/usePosQueries";
import { AnimatedPage } from "@/components/animated-page";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Tag, Button as AntButton, Popconfirm } from "antd";
import { Receipt, Ban } from "lucide-react";
import { toast } from "sonner";
import { formatBaht } from "@/lib/money";
import type { Order, OrderStatus } from "@/types/api";
import { format } from "date-fns";

function statusColor(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "PREPARING":
      return "processing";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function PosOrdersPage() {
  const { activeBranchId, user } = useAuth();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;
  const { data: orders = [], isLoading } = useBranchOrders(branchId);
  const voidMutation = useVoidOrder();

  const canVoid = user?.role === "SUPER_ADMIN" || user?.role === "MANAGER";

  const todayOrders = useMemo(
    () =>
      [...orders]
        .filter((o: Order) => isToday(o.createdAt))
        .sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [orders],
  );

  const handleVoid = async (orderId: number) => {
    try {
      await voidMutation.mutateAsync(orderId);
      toast.success(`Order #${orderId} voided — stock and ledger reversed`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to void order");
    }
  };

  if (!branchId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Select a branch to view today&apos;s orders.
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader
        title="Today's Orders"
        icon={Receipt}
        description="Void same-day sales to restore inventory and reverse accounting entries."
      />

      <DataTable
        loading={isLoading}
        rowKey="id"
        dataSource={todayOrders}
        columns={[
          {
            title: "Order #",
            dataIndex: "id",
            key: "id",
            render: (id: number) => (
              <span className="font-mono font-bold">#{id}</span>
            ),
          },
          {
            title: "Time",
            dataIndex: "createdAt",
            key: "time",
            render: (v: string) => format(new Date(v), "HH:mm"),
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: OrderStatus) => (
              <Tag color={statusColor(status)}>{status}</Tag>
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
              <span className="font-mono font-bold">{formatBaht(v)}</span>
            ),
          },
          {
            title: "Items",
            key: "items",
            render: (_: unknown, row: Order) =>
              row.items?.length ?? 0,
          },
          {
            title: "Actions",
            key: "actions",
            align: "right" as const,
            render: (_: unknown, row: Order) => {
              if (!canVoid || row.status === "CANCELLED") return null;
              return (
                <Popconfirm
                  title={`Void order #${row.id}?`}
                  description="Restores stock and posts a reversing journal entry."
                  onConfirm={() => handleVoid(row.id)}
                >
                  <AntButton
                    type="text"
                    danger
                    icon={<Ban className="w-4 h-4" />}
                    loading={voidMutation.isPending}
                  >
                    Void
                  </AntButton>
                </Popconfirm>
              );
            },
          },
        ]}
      />
    </AnimatedPage>
  );
}
