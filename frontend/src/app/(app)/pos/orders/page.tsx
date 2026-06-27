"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBranchOrders, useVoidOrder, useRefundOrder } from "@/hooks/domains/usePosQueries";
import { HubCard } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, orderStatusTone } from "@/components/shared/status-badge";
import { Receipt, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatBaht } from "@/lib/money";
import { formatQueueNumber } from "@/lib/queue";
import type { Order, OrderStatus } from "@/types/api";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isTerminal(status: OrderStatus) {
  return status === "CANCELLED" || status === "REFUNDED";
}

const LOOKBACK_DAYS = 14;

export default function PosOrdersPage() {
  const { activeBranchId, user } = useAuth();
  const branchId = activeBranchId ? Number(activeBranchId) : undefined;
  const { data: orders = [], isLoading } = useBranchOrders(branchId);
  const voidMutation = useVoidOrder();
  const refundMutation = useRefundOrder();

  const [refundTarget, setRefundTarget] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [voidTarget, setVoidTarget] = useState<Order | null>(null);

  const canManage = user?.role === "SUPER_ADMIN" || user?.role === "MANAGER";

  const recentOrders = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
    return [...orders]
      .filter((o: Order) => new Date(o.createdAt) >= cutoff)
      .sort(
        (a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders]);

  const handleVoid = async (orderId: number) => {
    try {
      await voidMutation.mutateAsync(orderId);
      toast.success(`Order #${orderId} voided — stock and ledger reversed`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to void order");
    }
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    try {
      await refundMutation.mutateAsync({
        orderId: refundTarget.id,
        reason: refundReason.trim() || undefined,
      });
      toast.success(`Order #${refundTarget.id} refunded`);
      setRefundTarget(null);
      setRefundReason("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to refund order");
    }
  };

  if (!branchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view orders and refunds." />
    );
  }

  return (
    <>
      <HubCard
        title="Orders & Refunds"
        icon={Receipt}
        description="Void same-day orders or refund completed sales from previous days."
      >
        <DataTable
          loading={isLoading}
          rowKey="id"
          dataSource={recentOrders}
          columns={[
            {
              title: "Queue",
              dataIndex: "queueNumber",
              key: "queue",
              render: (n: number | null) => (
                <span className="font-mono font-bold text-emerald-600">
                  {formatQueueNumber(n)}
                </span>
              ),
            },
            {
              title: "Order #",
              dataIndex: "id",
              key: "id",
              render: (id: number) => (
                <span className="font-mono text-slate-500">#{id}</span>
              ),
            },
            {
              title: "Date",
              dataIndex: "createdAt",
              key: "date",
              render: (v: string) => format(new Date(v), "dd MMM HH:mm"),
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
                <span className="font-mono font-bold">{formatBaht(v)}</span>
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
                if (!canManage || isTerminal(row.status)) return null;

                if (isToday(row.createdAt)) {
                  return (
                    <TableActionButton
                      icon={Ban}
                      label="Void"
                      destructive
                      onClick={() => setVoidTarget(row)}
                    />
                  );
                }

                if (row.status === "COMPLETED") {
                  return (
                    <TableActionButton
                      icon={RotateCcw}
                      label="Refund"
                      onClick={() => {
                        setRefundTarget(row);
                        setRefundReason("");
                      }}
                    />
                  );
                }

                return null;
              },
            },
          ]}
        />
      </HubCard>

      <ConfirmDialog
        open={voidTarget !== null}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title={voidTarget ? `Void order #${voidTarget.id}?` : "Void order?"}
        description="Same-day cancel — restores stock and reverses GL."
        confirmLabel="Void"
        destructive
        loading={voidMutation.isPending}
        onConfirm={async () => {
          if (voidTarget) await handleVoid(voidTarget.id);
        }}
      />

      <Dialog
        open={!!refundTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRefundTarget(null);
            setRefundReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund order #{refundTarget?.id}</DialogTitle>
            <DialogDescription>
              Posts a refund journal entry and restores inventory for this
              completed sale from a previous day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="refund-reason">Reason (optional)</Label>
            <Input
              id="refund-reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Customer complaint, wrong item, etc."
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              className="w-full"
              disabled={refundMutation.isPending}
              onClick={() => void handleRefund()}
            >
              Confirm refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
