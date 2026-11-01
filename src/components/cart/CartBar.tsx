"use client";

import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cartCount, useCartStore } from "@/features/cart/store";
import { formatMoney } from "@/lib/utils/format";
import { useHydrated } from "@/lib/utils/useHydrated";

/** Sticky "2 items · View cart · ₹560" bar at the bottom of the menu. */
export function CartBar() {
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const count = cartCount(lines);
  if (!hydrated || count === 0) return null;
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <div className="sticky bottom-0 z-30 px-5 pt-2 pb-6">
      <Link
        href="/cart"
        className="flex h-[58px] items-center justify-between rounded-[18px] bg-primary px-[18px] text-on-primary shadow-lg transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-2.5 font-semibold">
          <ShoppingBag className="size-[22px]" />
          {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="flex items-center gap-1 font-bold">
          View cart <ChevronRight className="size-[18px]" />
        </span>
        <span className="font-semibold">{formatMoney(subtotal)}</span>
      </Link>
    </div>
  );
}
