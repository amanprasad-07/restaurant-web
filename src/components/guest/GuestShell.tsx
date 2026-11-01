"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/features/cart/store";
import { useSessionStore } from "@/features/session/store";
import { useSocketEvent } from "@/lib/sockets/hooks";
import { Button } from "@/components/ui/Button";

/** Phone-width column (centred on desktop). Also reacts when the bill is settled and the table is released. */
export function GuestShell({ children }: { children: React.ReactNode }) {
  const token = useSessionStore((s) => s.sessionToken);
  const clearSession = useSessionStore((s) => s.clear);
  const clearCart = useCartStore((s) => s.clear);
  const [ended, setEnded] = useState(false);

  useSocketEvent<{ tableId: string }>(token, "table:released", () => {
    clearSession();
    clearCart();
    setEnded(true);
  });

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-canvas sm:border-x sm:border-line">
      {ended ? <ThankYou onDone={() => setEnded(false)} /> : children}
    </div>
  );
}

function ThankYou({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="text-5xl" aria-hidden>
        🍽️
      </div>
      <h1 className="text-2xl font-bold">Thanks for dining with us!</h1>
      <p className="text-muted">Your bill is settled and the table has been released. We hope to see you again soon.</p>
      <Link href="/" onClick={onDone}>
        <Button variant="soft">Done</Button>
      </Link>
    </div>
  );
}
