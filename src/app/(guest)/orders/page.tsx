"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { GuestHeader } from "@/components/guest/GuestHeader";
import { NoSession } from "@/components/guest/NoSession";
import { OrderCard } from "@/components/orders/OrderCard";
import { ServiceBar } from "@/components/orders/ServiceBar";
import { Button } from "@/components/ui/Button";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { ORDERS_KEY, upsertOrder, useOrders } from "@/features/orders/useOrders";
import { useSessionStore } from "@/features/session/store";
import { ApiError } from "@/lib/api/client";
import { cancelOrder } from "@/lib/api/guest";
import type { Order } from "@/lib/types";
import { useHydrated } from "@/lib/utils/useHydrated";

// G5: live order tracking, cancel-while-placed, and the tabletop service buttons.
export default function OrdersPage() {
  const hydrated = useHydrated();
  const token = useSessionStore((s) => s.sessionToken);
  const qc = useQueryClient();
  const orders = useOrders();

  const cancel = useMutation({
    mutationFn: (orderId: string) => cancelOrder(token!, orderId),
    onSuccess: (updated: Order) => qc.setQueryData<Order[]>(ORDERS_KEY, (old) => upsertOrder(old, updated)),
    onError: () => void orders.refetch(), // the kitchen may have just accepted it: show the real status
  });

  if (!hydrated) return <FullScreenSpinner />;
  if (!token) return <NoSession />;
  if (orders.error instanceof ApiError && orders.error.status === 401) {
    return <NoSession message="Your table session has ended. Scan the QR code again to keep ordering." />;
  }

  const list = [...(orders.data ?? [])].reverse(); // newest first

  return (
    <>
      <GuestHeader title="Your orders" backHref="/menu" />
      <main className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-4">
        {orders.isLoading && <FullScreenSpinner />}
        {orders.data && list.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-lg font-semibold">No orders yet</p>
            <Link href="/menu"><Button>Browse menu</Button></Link>
          </div>
        )}
        <ul className="flex flex-col gap-3">
          {list.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              cancelling={cancel.isPending && cancel.variables === o.id}
              cancelError={cancel.isError && cancel.variables === o.id ? cancel.error.message : undefined}
              onCancel={() => cancel.mutate(o.id)}
            />
          ))}
        </ul>
      </main>
      <ServiceBar />
    </>
  );
}
