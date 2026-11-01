"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Restaurant, ScanResponse, TableInfo } from "@/lib/types";

interface SessionState {
  sessionToken: string | null;
  restaurant: Restaurant | null;
  table: TableInfo | null;
  start: (scan: ScanResponse) => void;
  clear: () => void;
}

// sessionStorage (not localStorage): closing the tab ends the "session", re-scanning rejoins it.
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionToken: null,
      restaurant: null,
      table: null,
      start: (scan) => set({ sessionToken: scan.sessionToken, restaurant: scan.restaurant, table: scan.table }),
      clear: () => set({ sessionToken: null, restaurant: null, table: null }),
    }),
    { name: "rq-session", storage: createJSONStorage(() => sessionStorage) },
  ),
);
