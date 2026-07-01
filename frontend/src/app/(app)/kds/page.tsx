"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  KdsImmersiveHeader,
} from "@/components/kds/KdsImmersiveChrome";
import type { KdsPendingAction } from "@/components/kds/KdsOrderTicket";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { QueryLoadingPanel } from "@/components/shared/query-states";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useKdsOrders, useUpdateKdsOrderStatus } from "@/hooks/domains/usePosQueries";
import { useKdsSocketSync } from "@/hooks/useKdsSocketSync";
import { useKdsWaitClock } from "@/hooks/useKdsWaitClock";
import { ChefHat } from "lucide-react";
import { formatQueueNumber } from "@/lib/queue";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import {
  kdsEmptyIconClassName,
  kdsEmptyStateClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";

const KdsOrderBoard = dynamic(
  () => import("@/components/kds/KdsOrderBoard").then((m) => m.KdsOrderBoard),
  {
    loading: () => (
      <QueryLoadingPanel message="Loading board…" variant="kds" minHeightClassName="min-h-[16rem]" />
    ),
  },
);

export default function KdsPage() {
  const { activeBranchId } = useAuth();
  const { isConnected } = useSocket();
  const now = useKdsWaitClock();
  const [pendingAction, setPendingAction] = useState<KdsPendingAction | null>(null);
  const [confirmDoneId, setConfirmDoneId] = useState<number | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useKdsOrders(activeBranchId ?? undefined, isConnected);

  const updateStatusMutation = useUpdateKdsOrderStatus(activeBranchId ?? undefined);
  useKdsSocketSync(activeBranchId ?? undefined);

  const handleUpdateStatus = async (
    orderId: number,
    status: KdsPendingAction["status"],
  ) => {
    setPendingAction({ orderId, status });
    try {
      await updateStatusMutation.mutateAsync({ orderId, status });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update order status"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleStart = (orderId: number) => {
    void handleUpdateStatus(orderId, "PREPARING");
  };

  const handleRequestDone = (orderId: number) => {
    setConfirmDoneId(orderId);
  };

  const handleCancelDone = () => {
    setConfirmDoneId(null);
  };

  const handleConfirmDone = async (order: Order) => {
    const queueLabel = formatQueueNumber(order.queueNumber);
    setConfirmDoneId(null);
    setPendingAction({ orderId: order.id, status: "COMPLETED" });
    try {
      await updateStatusMutation.mutateAsync({ orderId: order.id, status: "COMPLETED" });
      toast.success(`Order #${queueLabel} completed`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            void handleUpdateStatus(order.id, "PREPARING");
          },
        },
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to complete order"));
    } finally {
      setPendingAction(null);
    }
  };

  if (!activeBranchId) {
    return (
      <div className="flex h-full flex-col">
        <BranchEmptyState title="Select a branch for KDS" />
      </div>
    );
  }

  const fetchError = isError ? getErrorMessage(error, "Failed to load kitchen orders") : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-4">
      <KdsImmersiveHeader />

      {fetchError && (
        <QueryErrorBanner
          className="shrink-0"
          message={fetchError}
          onRetry={() => void refetch()}
          loading={isFetching}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <QueryLoadingPanel message="Loading orders…" variant="kds" minHeightClassName="min-h-[16rem]" />
        ) : orders.length === 0 && !isError ? (
          <div className={kdsEmptyStateClassName()}>
            <ChefHat className={kdsEmptyIconClassName("mb-3 h-10 w-10")} aria-hidden />
            <p className={typeUiLabelClassName(text.primary)}>No pending orders</p>
            <p className={cn("mt-1 text-sm", text.muted)}>
              New tickets will appear here automatically.
            </p>
          </div>
        ) : !isError ? (
          <KdsOrderBoard
            orders={orders}
            now={now}
            pendingAction={pendingAction}
            confirmDoneId={confirmDoneId}
            onStart={handleStart}
            onRequestDone={handleRequestDone}
            onCancelDone={handleCancelDone}
            onConfirmDone={handleConfirmDone}
          />
        ) : null}
      </div>
    </div>
  );
}
