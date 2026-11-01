"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/features/session/store";
import { fetchSessionOrders } from "@/lib/api/guest";
import { useSocketEvent, useSocketStatus } from "@/lib/sockets/hooks";
import type { Order } from "@/lib/types";

export const ORDERS_KEY = ["orders"];

const byPlacedAt = (a: Order, b: Order) =>
  Date.parse(a.placedAt) - Date.parse(b.placedAt);

export function upsertOrder(list: Order[] | undefined, order: Order): Order[] {
  const rest = (list ?? []).filter((o) => o.id !== order.id);
  return [...rest, order].sort(byPlacedAt);
}

/** All orders of this table's party, updated live as the kitchen moves them along. */
export function useOrders() {
  const token = useSessionStore((s) => s.sessionToken);
  const qc = useQueryClient();

  const status = useSocketStatus(
    token,
    () => void qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  );

  const query = useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => fetchSessionOrders(token!),
    enabled: !!token,
    refetchInterval: status === "connected" ? false : 4000, // fallback only
  });

  const put = (order: Order) =>
    qc.setQueryData<Order[]>(ORDERS_KEY, (old) => upsertOrder(old, order));
  useSocketEvent<Order>(token, "order:status_changed", put);
  useSocketEvent<Order>(token, "table:order_created", put);

  return { ...query, putOrder: put, socketStatus: status };
}
