import type { Order, OrderStatus } from "@/lib/types";

/** The kitchen's one-button workflow. Mirrors the state machine in the backend. */
export const NEXT_STEP: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; style: "primary" | "outline" | "success" }>
> = {
  PLACED: { to: "ACCEPTED", label: "Accept", style: "primary" },
  ACCEPTED: { to: "PREPARING", label: "Start preparing", style: "outline" },
  PREPARING: { to: "SERVED", label: "Mark served", style: "success" },
};

export const ON_KDS: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING"];

/** green under 5 minutes, amber 5 to 10, red after that */
export function ageTone(ms: number): "success" | "warn" | "danger" {
  const min = ms / 60_000;
  return min < 5 ? "success" : min < 10 ? "warn" : "danger";
}

/** Add, replace, or drop an order depending on whether the kitchen still cares about it. */
export function applyKdsOrder(list: Order[], order: Order): Order[] {
  const rest = list.filter((o) => o.id !== order.id);
  if (!ON_KDS.includes(order.status)) return rest;
  return [...rest, order].sort((a, b) => Date.parse(a.placedAt) - Date.parse(b.placedAt));
}
