"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchKitchenQueue } from "@/lib/api/staff";
import { useSocketEvent } from "@/lib/sockets/hooks";
import type { Order } from "@/lib/types";
import { applyKdsOrder } from "./flow";

const KEY = ["kds-queue"];

/** Active kitchen tickets: REST for the first paint, then live over the socket. */
export function useKdsQueue(token: string, onNewOrder?: (order: Order) => void) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: () => fetchKitchenQueue(token) });

  const upsert = (order: Order) => qc.setQueryData<Order[]>(KEY, (old) => applyKdsOrder(old ?? [], order));

  useSocketEvent<Order>(token, "kds:new_order", (order) => {
    upsert(order);
    onNewOrder?.(order);
  });
  useSocketEvent<Order>(token, "order:status_changed", upsert);

  return { orders: query.data ?? [], isLoading: query.isLoading, error: query.error, refetch: query.refetch, upsert };
}
