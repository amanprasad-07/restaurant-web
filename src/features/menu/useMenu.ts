"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/features/session/store";
import { fetchMenu } from "@/lib/api/guest";
import { useSocketEvent } from "@/lib/sockets/hooks";
import type { MenuAvailabilityEvent, MenuCategory } from "@/lib/types";

/** Menu for the current table, kept live: an "86" from the kitchen flips the item to sold out instantly. */
export function useMenu() {
  const token = useSessionStore((s) => s.sessionToken);
  const restaurantId = useSessionStore((s) => s.restaurant?.id);
  const qc = useQueryClient();
  const key = ["menu", restaurantId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchMenu(restaurantId!, token!),
    enabled: !!token && !!restaurantId,
  });

  useSocketEvent<MenuAvailabilityEvent>(token, "menu:item_availability", ({ itemId, isAvailable }) => {
    qc.setQueryData<MenuCategory[]>(key, (old) =>
      old?.map((c) => ({ ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, isAvailable } : i)) })),
    );
  });

  return query;
}
