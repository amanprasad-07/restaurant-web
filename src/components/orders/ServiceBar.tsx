"use client";

import { Bell, Check, Droplet, Receipt, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useSessionStore } from "@/features/session/store";
import { ApiError } from "@/lib/api/client";
import { sendServiceAlert } from "@/lib/api/guest";
import type { ServiceRequestType } from "@/lib/types";
import { cn } from "@/lib/utils/format";

const ACTIONS: { type: ServiceRequestType; label: string; Icon: LucideIcon }[] = [
  { type: "CALL_WAITER", label: "Call waiter", Icon: Bell },
  { type: "WATER", label: "Water", Icon: Droplet },
  { type: "BILL", label: "Bill", Icon: Receipt },
];

/** "Need something?": the three tabletop service triggers. The server enforces a 30 s cooldown per request type. */
export function ServiceBar() {
  const token = useSessionStore((s) => s.sessionToken);
  const [sent, setSent] = useState<ServiceRequestType | null>(null);
  const [busy, setBusy] = useState<ServiceRequestType | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const send = async (type: ServiceRequestType) => {
    if (!token || busy) return;
    setBusy(type);
    setNotice(null);
    try {
      await sendServiceAlert(token, type);
      setSent(type);
      setNotice("Sent. A team member is on the way.");
      setTimeout(() => setSent((s) => (s === type ? null : s)), 4000);
    } catch (e) {
      setNotice(e instanceof ApiError && e.status === 429 ? "Already sent. Staff are on the way." : e instanceof Error ? e.message : "Couldn’t send.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 flex flex-col gap-2.5 bg-surface px-5 pt-3.5 pb-7 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <p className="text-[13px] font-semibold text-muted">Need something?</p>
      <div className="flex gap-2.5">
        {ACTIONS.map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            disabled={busy !== null}
            onClick={() => send(type)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-[14px] py-3 text-xs font-semibold transition active:scale-95 disabled:opacity-60",
              sent === type ? "bg-success/15 text-success" : "bg-surface-2",
            )}
          >
            {sent === type ? <Check className="size-[22px]" /> : <Icon className="size-[22px] text-primary" />}
            {label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="min-h-4 text-center text-xs text-muted">{notice}</p>
    </div>
  );
}
