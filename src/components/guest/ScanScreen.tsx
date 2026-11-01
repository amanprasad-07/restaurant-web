"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCartStore } from "@/features/cart/store";
import { useSessionStore } from "@/features/session/store";
import { ApiError } from "@/lib/api/client";
import { scanTable } from "@/lib/api/guest";
import { ScanSplash, type ScanProblem } from "./ScanSplash";

/** Resolves the QR token: starts (or joins) the party's session, then goes to the menu. */
export function ScanScreen({ token }: { token: string }) {
  const router = useRouter();
  const startSession = useSessionStore((s) => s.start);
  const clearCart = useCartStore((s) => s.clear);
  const [problem, setProblem] = useState<ScanProblem | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    setProblem(null);
    try {
      const scan = await scanTable(token);
      // A different table than last time? Don't carry the old cart over.
      if (useSessionStore.getState().table?.id !== scan.table.id) clearCart();
      startSession(scan);
      router.replace("/menu");
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setProblem({ title: "We don’t recognise this code", detail: "Please ask your server for help.", retry: false });
      } else if (e instanceof ApiError && e.status === 429) {
        setProblem({ title: "Too many scans", detail: "Wait a moment, then try again.", retry: true });
      } else {
        setProblem({
          title: "Couldn’t reach the restaurant",
          detail: e instanceof Error ? e.message : "Check your connection.",
          retry: true,
        });
      }
    }
  }, [token, router, startSession, clearCart]);

  useEffect(() => {
    if (started.current) return; // strict mode runs effects twice in dev
    started.current = true;
    void run();
  }, [run]);

  return <ScanSplash problem={problem} onRetry={() => void run()} />;
}
