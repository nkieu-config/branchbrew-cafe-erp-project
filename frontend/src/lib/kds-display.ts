import type { KdsTicketUrgency } from "@/lib/theme/immersive";
import type { Order } from "@/types/api";

export type KdsItemTally = { name: string; qty: number };

/** All-day per-item totals across the active queue, busiest first. */
export function summarizeKdsItems(orders: Order[]): KdsItemTally[] {
  const byName = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const name = item.product?.name ?? "Item";
      byName.set(name, (byName.get(name) ?? 0) + item.quantity);
    }
  }
  return Array.from(byName, ([name, qty]) => ({ name, qty })).sort(
    (a, b) => b.qty - a.qty || a.name.localeCompare(b.name),
  );
}

export function getWaitTimeMinutes(createdAt: string, now = Date.now()): number {
  const diff = now - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diff / 60_000));
}

export function formatKdsWaitLabel(waitMinutes: number): string {
  if (waitMinutes < 1) return "<1 min";
  if (waitMinutes < 60) return `${waitMinutes} min`;
  const hours = Math.floor(waitMinutes / 60);
  const minutes = waitMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function ticketUrgency(waitMinutes: number): KdsTicketUrgency {
  if (waitMinutes >= 10) return "late";
  if (waitMinutes >= 5) return "warning";
  return "on-time";
}

export function splitKdsOrdersByStatus<T extends { status: string }>(orders: T[]) {
  const pending: T[] = [];
  const preparing: T[] = [];
  for (const order of orders) {
    if (order.status === "PREPARING") {
      preparing.push(order);
    } else {
      pending.push(order);
    }
  }
  return { pending, preparing };
}
