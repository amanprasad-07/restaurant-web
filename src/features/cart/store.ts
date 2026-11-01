"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppliedModifier, DietaryType } from "@/lib/types";

export interface CartLine {
  key: string; // same dish + same options + same note = same line
  menuItemId: string;
  name: string;
  dietaryType: DietaryType | null;
  unitPrice: number; // base + modifier costs (an estimate; the server re-prices on order)
  quantity: number;
  modifiers: AppliedModifier[];
  prepNotes: string;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const MAX_QTY = 20;

export const lineKey = (l: Pick<CartLine, "menuItemId" | "modifiers" | "prepNotes">) =>
  [l.menuItemId, l.modifiers.map((m) => `${m.name}=${m.option}`).join("|"), l.prepNotes.trim().toLowerCase()].join("::");

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + line.quantity) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, key }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "rq-cart", storage: createJSONStorage(() => sessionStorage) },
  ),
);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Display-only estimate. The server computes the real totals when the order is placed. */
export function estimateTotals(lines: CartLine[], taxRate: number, serviceRate: number) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
  const tax = round2((subtotal * taxRate) / 100);
  const service = round2((subtotal * serviceRate) / 100);
  return { subtotal, tax, service, total: round2(subtotal + tax + service) };
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
