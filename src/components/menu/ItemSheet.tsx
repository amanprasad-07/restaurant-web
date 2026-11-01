"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DietDot } from "@/components/ui/DietDot";
import { Stepper } from "@/components/ui/Stepper";
import type { CartLine } from "@/features/cart/store";
import type { MenuItem } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils/format";

const NOTE_MAX = 200;

// G3: bottom sheet with modifier groups, quantity and a note for the kitchen.
// Mount it with key={item.id} so choices reset between dishes.
export function ItemSheet({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (line: Omit<CartLine, "key">) => void;
}) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const missing = item.modifierGroups.find((g) => g.required && !choices[g.name]);
  const modifiers = item.modifierGroups.flatMap((g) => {
    const opt = g.options.find((o) => o.name === choices[g.name]);
    return opt ? [{ name: g.name, option: opt.name, cost: opt.cost }] : [];
  });
  const unitPrice = item.price + modifiers.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={item.name}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/55" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[26px] bg-surface">
        <div className="mx-auto mt-2.5 mb-2 h-1 w-10 shrink-0 rounded-full bg-line" />

        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <div className="h-[150px] overflow-hidden rounded-[18px] bg-linear-to-br from-[#f6d3bc] to-[#e5a67f]">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="size-full object-cover" />
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <DietDot type={item.dietaryType} />
              <h2 className="truncate text-[22px] font-bold">{item.name}</h2>
            </div>
            <span className="text-xl font-bold">{formatMoney(item.price)}</span>
          </div>
          {item.description && <p className="mt-2 text-sm leading-5 text-muted">{item.description}</p>}
          {item.allergens.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Chip className="text-[11px]">Contains</Chip>
              {item.allergens.map((a) => (
                <Chip key={a} className="text-[11px] capitalize">{a.toLowerCase()}</Chip>
              ))}
            </div>
          )}

          {item.modifierGroups.map((group) => (
            <fieldset key={group.name} className="mt-5">
              <legend className="flex w-full items-center justify-between pb-1.5">
                <span className="text-base font-semibold">{group.name}</span>
                {group.required && <Chip tone="primary" className="px-2 py-0.5 text-[11px] font-semibold">Required</Chip>}
              </legend>
              <div role="radiogroup" aria-label={group.name}>
                {group.options.map((opt, i) => {
                  const selected = choices[group.name] === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setChoices((c) => ({ ...c, [group.name]: opt.name }))}
                      className={cn(
                        "flex w-full items-center justify-between py-[11px] text-left",
                        i < group.options.length - 1 && "border-b border-line",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-[22px] items-center justify-center rounded-full border-2",
                            selected ? "border-primary bg-primary" : "border-line",
                          )}
                        >
                          {selected && <span className="size-2 rounded-full bg-on-primary" />}
                        </span>
                        <span className={cn("text-[15px]", selected && "font-semibold")}>{opt.name}</span>
                      </span>
                      {opt.cost > 0 && <span className="text-[13px] text-muted">+{formatMoney(opt.cost)}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-5 mb-2">
            <label htmlFor="notes" className="text-sm font-semibold">Special instructions</label>
            <textarea
              id="notes"
              value={notes}
              maxLength={NOTE_MAX}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. less salt, sauce on the side"
              rows={2}
              className="mt-1.5 w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none focus:border-primary"
            />
            <p className="text-right text-[11px] text-muted">{notes.length} / {NOTE_MAX}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line px-5 pt-3.5 pb-7">
          <Stepper value={quantity} onChange={setQuantity} />
          <Button
            block
            className="h-[54px] flex-1 rounded-2xl text-base"
            disabled={!!missing}
            onClick={() =>
              onAdd({
                menuItemId: item.id,
                name: item.name,
                dietaryType: item.dietaryType,
                unitPrice,
                quantity,
                modifiers,
                prepNotes: notes.trim(),
              })
            }
          >
            {missing ? `Choose ${missing.name.toLowerCase()}` : `Add to cart · ${formatMoney(unitPrice * quantity)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
