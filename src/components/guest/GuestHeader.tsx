"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { useSessionStore } from "@/features/session/store";
import { useHydrated } from "@/lib/utils/useHydrated";

export function GuestHeader({ title, backHref }: { title: string; backHref: string }) {
  const hydrated = useHydrated();
  const table = useSessionStore((s) => s.table);
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-surface px-5 pt-12 pb-3.5">
      <div className="flex items-center gap-3">
        <Link href={backHref} aria-label="Back" className="flex size-10 items-center justify-center rounded-full bg-surface-2">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      {hydrated && table && <Chip tone="primary" className="font-semibold">{table.tableNumber}</Chip>}
    </header>
  );
}
