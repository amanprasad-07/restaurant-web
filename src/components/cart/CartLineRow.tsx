"use client";

import { Trash2 } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Stepper } from "@/components/ui/Stepper";
import type { CartLine } from "@/features/cart/store";
import { cn, formatMoney } from "@/lib/utils/format";

export function CartLineRow({
  line,
  soldOut,
  onQuantity,
  onRemove,
}: {
  line: CartLine;
  soldOut: boolean;
  onQuantity: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className={cn("flex items-center justify-between gap-3 px-4 py-3.5", soldOut && "bg-danger/7")}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[15px] font-semibold">
          {line.quantity}× {line.name}
        </p>
        {line.modifiers.length > 0 && (
          <p className="text-xs text-muted">{line.modifiers.map((m) => `${m.name}: ${m.option}`).join(" · ")}</p>
        )}
        {line.prepNotes && <p className="text-xs text-muted">“{line.prepNotes}”</p>}
        {soldOut && <Chip tone="danger" className="w-fit px-2 py-0.5 text-[11px] font-semibold">Sold out</Chip>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={cn("text-[15px] font-semibold", soldOut && "text-muted line-through")}>
          {formatMoney(line.unitPrice * line.quantity)}
        </span>
        {soldOut ? (
          <button type="button" onClick={onRemove} className="text-[13px] font-semibold text-danger">Remove</button>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" aria-label={`Remove ${line.name}`} onClick={onRemove} className="p-1 text-muted hover:text-danger">
              <Trash2 className="size-4" />
            </button>
            <Stepper size="sm" value={line.quantity} onChange={onQuantity} />
          </div>
        )}
      </div>
    </li>
  );
}
