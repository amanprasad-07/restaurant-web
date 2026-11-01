"use client";

import { Plus } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { DietDot } from "@/components/ui/DietDot";
import { cn, formatMoney } from "@/lib/utils/format";
import type { MenuItem } from "@/lib/types";

export function ItemCard({
  item,
  onOpen,
  onQuickAdd,
}: {
  item: MenuItem;
  onOpen: () => void;
  onQuickAdd: () => void;
}) {
  const soldOut = !item.isAvailable;
  return (
    <article
      role="button"
      tabIndex={soldOut ? -1 : 0}
      aria-disabled={soldOut}
      onClick={() => !soldOut && onOpen()}
      onKeyDown={(e) => {
        if (!soldOut && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "flex gap-3 rounded-[18px] border border-line bg-surface p-3.5 text-left transition",
        soldOut ? "opacity-55" : "cursor-pointer hover:border-primary/40 active:scale-[0.99]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <DietDot type={item.dietaryType} />
          <h3 className="truncate text-base font-semibold">{item.name}</h3>
        </div>
        {item.description && <p className="line-clamp-2 text-[13px] leading-[18px] text-muted">{item.description}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">{formatMoney(item.price)}</span>
          {item.allergens.map((a) => (
            <Chip key={a} className="px-2 py-0.5 text-[11px] capitalize">
              {a.toLowerCase()}
            </Chip>
          ))}
        </div>
        {soldOut && <Chip tone="danger" className="w-fit px-2 py-0.5 text-[11px] font-semibold">Sold out</Chip>}
      </div>

      <div className="relative size-24 shrink-0 overflow-hidden rounded-[14px] bg-linear-to-br from-[#f6d3bc] to-[#e5a67f]">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        )}
        {!soldOut && (
          <button
            type="button"
            aria-label={`Add ${item.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className="absolute right-1.5 bottom-1.5 flex size-[34px] items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition active:scale-90"
          >
            <Plus className="size-[18px]" />
          </button>
        )}
      </div>
    </article>
  );
}
