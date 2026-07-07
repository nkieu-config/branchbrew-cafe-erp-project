"use client";

import { useState } from "react";
import { KdsOrderColumn } from "@/components/kds/KdsOrderColumn";
import type { KdsPendingAction } from "@/components/kds/KdsOrderTicket";
import { splitKdsOrdersByStatus, summarizeKdsItems } from "@/lib/kds-display";
import {
  kdsColumnBoardClassName,
  kdsMobileColumnSwitchClassName,
  kdsMobileColumnTabClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";

type KdsMobileColumn = "new" | "cooking";

type KdsOrderBoardProps = {
  orders: Order[];
  now: number;
  pendingAction: KdsPendingAction | null;
  confirmDoneId: number | null;
  onStart: (orderId: number) => void;
  onRequestDone: (orderId: number) => void;
  onCancelDone: () => void;
  onConfirmDone: (order: Order) => void;
};

export function KdsOrderBoard({
  orders,
  now,
  pendingAction,
  confirmDoneId,
  onStart,
  onRequestDone,
  onCancelDone,
  onConfirmDone,
}: KdsOrderBoardProps) {
  const { pending, preparing } = splitKdsOrdersByStatus(orders);
  const allDayItems = summarizeKdsItems(orders);
  const [mobileColumn, setMobileColumn] = useState<KdsMobileColumn>("new");

  const columnProps = {
    now,
    pendingAction,
    confirmDoneId,
    onStart,
    onRequestDone,
    onCancelDone,
    onConfirmDone,
  };

  return (
    <div className={kdsColumnBoardClassName()}>
      {allDayItems.length > 0 && (
        <div
          className={cn(
            "shrink-0 lg:col-span-2 flex flex-wrap items-center gap-2 rounded-xl px-3 py-2",
            "bg-[var(--kds-ticket-bg)] border border-[var(--kds-ticket-divider)]",
          )}
          aria-label="All-day item totals"
        >
          <span className={cn("text-xs font-semibold uppercase tracking-wider", text.muted)}>
            All-day
          </span>
          {allDayItems.map((item) => (
            <span
              key={item.name}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm tabular-nums",
                "bg-[var(--hub-tab-track)]",
                text.primary,
              )}
            >
              {item.name}
              <span className="font-bold">×{item.qty}</span>
            </span>
          ))}
        </div>
      )}
      <div
        className={kdsMobileColumnSwitchClassName()}
        role="tablist"
        aria-label="Kitchen queue columns"
      >
        <button
          type="button"
          role="tab"
          id="kds-column-new"
          aria-selected={mobileColumn === "new"}
          aria-controls="kds-panel-new"
          onClick={() => setMobileColumn("new")}
          className={kdsMobileColumnTabClassName(mobileColumn === "new")}
        >
          New
          <span aria-hidden="true">({pending.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          id="kds-column-cooking"
          aria-selected={mobileColumn === "cooking"}
          aria-controls="kds-panel-cooking"
          onClick={() => setMobileColumn("cooking")}
          className={kdsMobileColumnTabClassName(mobileColumn === "cooking")}
        >
          Cooking
          <span aria-hidden="true">({preparing.length})</span>
        </button>
      </div>

      <KdsOrderColumn
        title="New"
        orders={pending}
        emptyMessage="No new orders"
        className={cn(mobileColumn !== "new" && "max-lg:hidden")}
        {...columnProps}
      />
      <KdsOrderColumn
        title="Cooking"
        orders={preparing}
        emptyMessage="Nothing cooking"
        className={cn(mobileColumn !== "cooking" && "max-lg:hidden")}
        {...columnProps}
      />
    </div>
  );
}
