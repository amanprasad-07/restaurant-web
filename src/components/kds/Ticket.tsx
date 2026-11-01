"use client";

import { Clock, CornerDownLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ageTone, NEXT_STEP } from "@/features/kds/flow";
import type { Order } from "@/lib/types";
import { cn, formatAge } from "@/lib/utils/format";

const TONE_BG = { success: "bg-success/18 text-success", warn: "bg-warn/18 text-warn", danger: "bg-danger/18 text-danger" };

export function Ticket({
  order,
  now,
  selected,
  fresh,
  busy,
  onSelect,
  onAdvance,
}: {
  order: Order;
  now: number;
  selected: boolean;
  fresh: boolean;
  busy: boolean;
  onSelect: () => void;
  onAdvance: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  const age = Math.max(0, now - Date.parse(order.placedAt));
  const tone = ageTone(age);
  const next = NEXT_STEP[order.status];

  return (
    <article
      ref={ref}
      onClick={onSelect}
      aria-label={`${order.orderNumber}, ${order.tableNumber}`}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border bg-surface p-4 transition",
        selected ? "border-[3px] border-primary" : "border-line",
        fresh && "animate-pulse ring-4 ring-primary/40",
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-bold">{order.orderNumber}</h3>
          <Chip tone="outline" className="bg-surface-2 text-[13px] font-semibold">{order.tableNumber}</Chip>
        </div>
        <span role="timer" className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-base font-bold tabular-nums", TONE_BG[tone])}>
          <Clock className="size-4" /> {formatAge(age)}
        </span>
      </header>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <span className="text-lg font-bold text-primary">{item.quantity}×</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[17px] font-semibold">{item.name}</p>
              {item.modifiers.length > 0 && (
                <p className="text-[13px] text-muted">{item.modifiers.map((m) => `${m.name}: ${m.option}`).join(" · ")}</p>
              )}
              {item.prepNotes && (
                <p className="flex w-fit items-center gap-1.5 rounded-lg bg-warn/16 px-2.5 py-1 text-[13px] font-medium text-warn">
                  <span className="text-[10px] font-bold tracking-widest">NOTE</span> {item.prepNotes}
                </p>
              )}
            </div>
            {item.station && <Chip className="px-2 py-0.5 text-[10px] font-bold tracking-widest">{item.station}</Chip>}
          </li>
        ))}
      </ul>

      {next && (
        <Button
          variant={next.style}
          block
          loading={busy}
          className="h-[52px] rounded-xl text-base"
          onClick={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
        >
          {next.label}
          {selected && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-on-primary/18 px-1.5 py-0.5 text-[11px] font-bold">
              <CornerDownLeft className="size-3" /> Enter
            </span>
          )}
        </Button>
      )}
    </article>
  );
}
