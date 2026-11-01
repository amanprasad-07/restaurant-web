"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import type { Order } from "@/lib/types";
import { formatMoney, formatTime } from "@/lib/utils/format";
import { StatusStepper } from "./StatusStepper";

const BADGE: Record<Order["status"], { label: string; tone: "primary" | "warn" | "success" | "neutral" | "danger" }> = {
  PLACED: { label: "Placed", tone: "primary" },
  ACCEPTED: { label: "Accepted", tone: "warn" },
  PREPARING: { label: "Preparing", tone: "warn" },
  SERVED: { label: "Served", tone: "success" },
  CLOSED: { label: "Paid", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export function OrderCard({
  order,
  cancelling,
  cancelError,
  onCancel,
}: {
  order: Order;
  cancelling: boolean;
  cancelError?: string;
  onCancel: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const badge = BADGE[order.status];
  const cancelled = order.status === "CANCELLED";

  return (
    <li className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold">{order.orderNumber}</p>
          <p className="text-xs text-muted">{formatTime(order.placedAt)}</p>
        </div>
        <Chip tone={badge.tone} className="font-semibold">{badge.label}</Chip>
      </div>

      {!cancelled && <StatusStepper status={order.status} />}

      <ul className="space-y-1 text-[13px] leading-[19px]">
        {order.items.map((i) => (
          <li key={i.id}>
            {i.quantity}× {i.name}
            {i.modifiers.length > 0 && <span className="text-muted"> · {i.modifiers.map((m) => m.option).join(", ")}</span>}
            {i.prepNotes && <span className="text-muted"> · “{i.prepNotes}”</span>}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-[13px] text-muted">Total</span>
        <span className="text-[15px] font-bold">{formatMoney(order.totalAmount, true)}</span>
      </div>

      {order.status === "PLACED" && (
        <div className="flex flex-col gap-1.5">
          {confirming ? (
            <div className="flex gap-2">
              <Button variant="soft" className="h-11 flex-1" onClick={() => setConfirming(false)}>Keep order</Button>
              <Button variant="danger" className="h-11 flex-1" loading={cancelling} onClick={onCancel}>Yes, cancel</Button>
            </div>
          ) : (
            <Button variant="danger" className="h-11 rounded-[14px]" onClick={() => setConfirming(true)}>Cancel order</Button>
          )}
          <p className="text-xs text-muted">You can cancel until the kitchen accepts it.</p>
          {cancelError && <p role="alert" className="text-xs font-medium text-danger">{cancelError}</p>}
        </div>
      )}
      {(order.status === "ACCEPTED" || order.status === "PREPARING") && (
        <p className="text-xs leading-[17px] text-muted">The kitchen has started this order. Ask your waiter if you need changes.</p>
      )}
      {order.status === "SERVED" && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium">Enjoy your meal! 🍽️</p>
          <Link href="/menu"><Button variant="outline" className="h-10 px-4 text-sm">Order more</Button></Link>
        </div>
      )}
      {cancelled && <p className="text-xs text-muted">{order.voidReason ?? "This order was cancelled."}</p>}
    </li>
  );
}
