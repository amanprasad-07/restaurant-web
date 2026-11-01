"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { fetchStaffMenu, set86 } from "@/lib/api/staff";
import { useSocketEvent } from "@/lib/sockets/hooks";
import type { MenuAvailabilityEvent, MenuCategory } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils/format";

const KEY = ["staff-menu"];

// S3: every dish with a switch. Turning one off ("86") removes it from every guest's menu instantly.
export function EightySixDrawer({ token, onClose }: { token: string; onClose: () => void }) {
  const qc = useQueryClient();
  const menu = useQuery({ queryKey: KEY, queryFn: () => fetchStaffMenu(token), staleTime: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setLocal = (itemId: string, isAvailable: boolean) =>
    qc.setQueryData<MenuCategory[]>(KEY, (old) =>
      old?.map((c) => ({ ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, isAvailable } : i)) })),
    );

  // another chef toggled something: stay in sync
  useSocketEvent<MenuAvailabilityEvent>(token, "menu:item_availability", (e) => setLocal(e.itemId, e.isAvailable));

  const toggle = async (itemId: string, next: boolean) => {
    setError(null);
    setLocal(itemId, next); // optimistic
    try {
      await set86(token, itemId, next);
    } catch (e) {
      setLocal(itemId, !next); // roll back
      setError(e instanceof Error ? e.message : "Couldn’t update the item.");
    }
  };

  const soldOutCount = (menu.data ?? []).reduce((n, c) => n + c.items.filter((i) => !i.isAvailable).length, 0);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="86 items">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-canvas">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold"><Ban className="size-5 text-primary" /> 86 items</h2>
            <p className="text-sm text-muted">{soldOutCount} sold out right now</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-10 items-center justify-center rounded-full bg-surface-2">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {menu.isLoading && <div className="flex justify-center py-16"><Spinner /></div>}
          {menu.error && <p role="alert" className="py-8 text-center text-danger">{menu.error.message}</p>}
          {error && <p role="alert" className="mb-3 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}

          {menu.data?.map((cat) => (
            <section key={cat.id} className="mb-6">
              <h3 className="mb-2 text-xs font-bold tracking-widest text-muted uppercase">{cat.name}</h3>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {cat.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className={cn("font-semibold", !item.isAvailable && "text-muted line-through")}>{item.name}</p>
                      <p className="text-xs text-muted">{formatMoney(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.isAvailable}
                      aria-label={`${item.name} available`}
                      onClick={() => toggle(item.id, !item.isAvailable)}
                      className={cn("relative h-8 w-14 shrink-0 rounded-full transition", item.isAvailable ? "bg-success" : "bg-surface-2")}
                    >
                      <span className={cn("absolute top-1 size-6 rounded-full bg-white transition-all", item.isAvailable ? "left-7" : "left-1")} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
