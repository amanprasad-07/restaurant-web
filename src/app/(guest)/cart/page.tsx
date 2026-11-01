"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { TotalsBox } from "@/components/cart/TotalsBox";
import { GuestHeader } from "@/components/guest/GuestHeader";
import { NoSession } from "@/components/guest/NoSession";
import { Button } from "@/components/ui/Button";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { cartCount, estimateTotals, useCartStore } from "@/features/cart/store";
import { useMenu } from "@/features/menu/useMenu";
import { ORDERS_KEY, upsertOrder } from "@/features/orders/useOrders";
import { useSessionStore } from "@/features/session/store";
import { ApiError } from "@/lib/api/client";
import { placeOrder } from "@/lib/api/guest";
import type { Order } from "@/lib/types";
import { useHydrated } from "@/lib/utils/useHydrated";

// G4: review the cart, see live sold-out warnings, place the order.
export default function CartPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const hydrated = useHydrated();
  const token = useSessionStore((s) => s.sessionToken);
  const restaurant = useSessionStore((s) => s.restaurant);
  const { lines, setQuantity, remove, clear } = useCartStore();
  const menu = useMenu(); // also keeps the live 86 updates flowing while the cart is open

  const order = useMutation({
    mutationFn: () =>
      placeOrder(
        token!,
        lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          modifiers: l.modifiers.map((m) => ({ name: m.name, option: m.option })),
          prepNotes: l.prepNotes || undefined,
        })),
      ),
    onSuccess: (placed: Order) => {
      qc.setQueryData<Order[]>(ORDERS_KEY, (old) => upsertOrder(old, placed));
      clear();
      router.push("/orders");
    },
  });

  if (!hydrated) return <FullScreenSpinner />;
  if (!token || !restaurant) return <NoSession />;

  const unavailable = new Set(
    (menu.data ?? []).flatMap((c) => c.items.filter((i) => !i.isAvailable).map((i) => i.id)),
  );
  const soldOutLines = lines.filter((l) => unavailable.has(l.menuItemId));
  const totals = estimateTotals(lines, restaurant.taxRate, restaurant.serviceCharge);

  const serverError =
    order.error instanceof ApiError && order.error.status === 401
      ? "Your table session has ended. Please scan the QR code again."
      : order.error?.message;
  const banner = soldOutLines.length
    ? `${soldOutLines.map((l) => l.name).join(", ")} ${soldOutLines.length > 1 ? "are" : "is"} no longer available. Remove ${soldOutLines.length > 1 ? "them" : "it"} to continue.`
    : serverError;

  return (
    <>
      <GuestHeader title="Your order" backHref="/menu" />

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-muted">Add a few dishes from the menu to get started.</p>
          <Link href="/menu"><Button>Browse menu</Button></Link>
        </div>
      ) : (
        <>
          <main className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-4">
            {banner && (
              <div role="alert" className="flex items-center gap-2.5 rounded-[14px] border border-danger bg-danger/10 px-3.5 py-3 text-[13px] font-medium text-danger">
                <AlertCircle className="size-5 shrink-0" />
                <span>{banner}</span>
              </div>
            )}

            <ul className="divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-surface">
              {lines.map((l) => (
                <CartLineRow
                  key={l.key}
                  line={l}
                  soldOut={unavailable.has(l.menuItemId)}
                  onQuantity={(q) => setQuantity(l.key, q)}
                  onRemove={() => remove(l.key)}
                />
              ))}
            </ul>

            <Link href="/menu" className="flex w-fit items-center gap-1.5 px-1 py-0.5 text-sm font-semibold text-primary">
              <Plus className="size-[18px]" /> Add more items
            </Link>

            <TotalsBox {...totals} taxRate={restaurant.taxRate} serviceRate={restaurant.serviceCharge} />
          </main>

          <div className="sticky bottom-0 border-t border-line bg-surface px-5 pt-3.5 pb-7">
            <Button
              block
              className="h-[54px] rounded-2xl text-base"
              loading={order.isPending}
              disabled={soldOutLines.length > 0 || cartCount(lines) === 0}
              onClick={() => order.mutate()}
            >
              {soldOutLines.length > 0 ? "Remove unavailable items to continue" : `Place order · ${totals.total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
