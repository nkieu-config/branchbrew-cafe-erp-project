import { CheckCircle2, Clock, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatKdsWaitLabel,
  getWaitTimeMinutes,
  ticketUrgency,
} from "@/lib/kds-display";
import { formatQueueNumber } from "@/lib/queue";
import {
  kdsConfirmCancelButtonClassName,
  kdsDoneButtonClassName,
  kdsItemDividerClassName,
  kdsItemModifiersClassName,
  kdsItemNameClassName,
  kdsItemNoteClassName,
  kdsItemQtyClassName,
  kdsStartButtonClassName,
  kdsTicketBodyClassName,
  kdsTicketClassName,
  kdsTicketFooterClassName,
  kdsTicketHeaderClassName,
  kdsTicketQueueClassName,
  kdsTimerClassName,
} from "@/lib/theme/immersive";
import type { Order, OrderItem, OrderStatus } from "@/types/api";

export type KdsPendingAction = {
  orderId: number;
  status: Extract<OrderStatus, "PREPARING" | "COMPLETED">;
};

type KdsOrderTicketProps = {
  order: Order;
  now: number;
  pendingAction: KdsPendingAction | null;
  confirmDoneId: number | null;
  onStart: (orderId: number) => void;
  onRequestDone: (orderId: number) => void;
  onCancelDone: () => void;
  onConfirmDone: (order: Order) => void;
};

function KdsTicketItem({ item }: { item: OrderItem }) {
  const modifiers = item.modifiers?.map((modifier) => modifier.optionName) ?? [];

  return (
    <div className={kdsItemDividerClassName()}>
      <div className="flex items-start gap-3">
        <span className={kdsItemQtyClassName()} aria-hidden>
          {item.quantity}x
        </span>
        <div className="min-w-0 flex flex-col">
          <span className={kdsItemNameClassName()}>
            {item.product?.name ?? "Item"}
          </span>
          {modifiers.length > 0 && (
            <p className={kdsItemModifiersClassName()}>
              {modifiers.join(" · ")}
            </p>
          )}
          {item.notes?.trim() && (
            <p className={kdsItemNoteClassName()}>{item.notes.trim()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function KdsOrderTicket({
  order,
  now,
  pendingAction,
  confirmDoneId,
  onStart,
  onRequestDone,
  onCancelDone,
  onConfirmDone,
}: KdsOrderTicketProps) {
  const queueLabel = formatQueueNumber(order.queueNumber);
  const waitMinutes = getWaitTimeMinutes(order.createdAt, now);
  const waitLabel = formatKdsWaitLabel(waitMinutes);
  const urgency = ticketUrgency(waitMinutes);
  const isUpdating = pendingAction?.orderId === order.id;
  const isStarting = isUpdating && pendingAction?.status === "PREPARING";
  const isCompleting = isUpdating && pendingAction?.status === "COMPLETED";
  const isConfirmingDone = confirmDoneId === order.id;
  const titleId = `kds-ticket-${order.id}-title`;

  return (
    <article className={kdsTicketClassName(urgency)} aria-labelledby={titleId}>
      <div className={kdsTicketHeaderClassName()}>
        <div id={titleId} className={kdsTicketQueueClassName()}>
          #{queueLabel}
        </div>
        <div className={kdsTimerClassName(urgency)} aria-label={`Waiting ${waitLabel}`}>
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          <span>{waitLabel}</span>
        </div>
      </div>

      <div className={kdsTicketBodyClassName()}>
        {order.items?.map((item) => (
          <KdsTicketItem key={item.id} item={item} />
        ))}
      </div>

      <div className={kdsTicketFooterClassName()}>
        {order.status === "PENDING" && (
          <Button
            className={kdsStartButtonClassName()}
            onClick={() => onStart(order.id)}
            disabled={isUpdating}
            aria-label={`Start order ${queueLabel}`}
          >
            {isStarting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Starting…
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" aria-hidden />
                Start
              </>
            )}
          </Button>
        )}
        {order.status === "PREPARING" && isConfirmingDone ? (
          <>
            <Button
              type="button"
              variant="outline"
              className={kdsConfirmCancelButtonClassName()}
              onClick={onCancelDone}
              disabled={isUpdating}
              aria-label={`Cancel completing order ${queueLabel}`}
            >
              Cancel
            </Button>
            <Button
              className={kdsDoneButtonClassName()}
              onClick={() => onConfirmDone(order)}
              disabled={isUpdating}
              aria-label={`Confirm order ${queueLabel} is done`}
            >
              {isCompleting ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                  Completing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                  Confirm
                </>
              )}
            </Button>
          </>
        ) : null}
        {order.status === "PREPARING" && !isConfirmingDone && (
          <Button
            className={kdsDoneButtonClassName()}
            onClick={() => onRequestDone(order.id)}
            disabled={isUpdating}
            aria-label={`Mark order ${queueLabel} as done`}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
            Done
          </Button>
        )}
      </div>
    </article>
  );
}
