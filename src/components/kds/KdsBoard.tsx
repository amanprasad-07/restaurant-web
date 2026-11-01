"use client";

import { Ban, Bell, LogOut, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Spinner } from "@/components/ui/Spinner";
import { NEXT_STEP } from "@/features/kds/flow";
import { useKdsQueue } from "@/features/kds/useKdsQueue";
import { updateOrderStatus } from "@/lib/api/staff";
import { useSocketEvent, useSocketStatus } from "@/lib/sockets/hooks";
import type { Order, Station, StaffUser, WaiterBellEvent } from "@/lib/types";
import { enableAudio, playBeep } from "@/lib/utils/beep";
import { cn } from "@/lib/utils/format";
import { useNow } from "@/lib/utils/useNow";
import { EightySixDrawer } from "./EightySixDrawer";
import { Ticket } from "./Ticket";

type StationFilter = Station | "ALL";
interface Bell_ { id: string; text: string }

const STATIONS: { value: StationFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "HOT", label: "Hot" },
  { value: "COLD", label: "Cold" },
  { value: "BAR", label: "Bar" },
];
const BELL_LABEL = { CALL_WAITER: "needs a waiter", WATER: "wants water", BILL: "asked for the bill" } as const;

export function KdsBoard({ token, user, onLogout }: { token: string; user: StaffUser; onLogout: () => void }) {
  const now = useNow(1000);
  const [station, setStation] = useState<StationFilter>("ALL");
  const [soundOn, setSoundOn] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Record<string, true>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bells, setBells] = useState<Bell_[]>([]);
  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  });

  const { orders, isLoading, error, refetch, upsert } = useKdsQueue(token, (order) => {
    if (soundRef.current) playBeep();
    setFresh((f) => ({ ...f, [order.id]: true }));
    setTimeout(() => setFresh(({ [order.id]: _gone, ...rest }) => rest), 4000);
  });
  const status = useSocketStatus(token, () => void refetch()); // re-sync after a dropped connection

  useSocketEvent<WaiterBellEvent>(token, "waiter:call_bell", (b) => {
    const id = `${b.timestamp}-${b.tableId}-${b.requestType}`;
    setBells((list) => [...list, { id, text: `${b.tableNumber} ${BELL_LABEL[b.requestType]}` }]);
    if (soundRef.current) playBeep();
    setTimeout(() => setBells((list) => list.filter((x) => x.id !== id)), 30_000);
  });

  // station view: hide tickets with nothing for this station, and hide the other stations' items
  const visible = useMemo(
    () =>
      orders
        .map((o) => (station === "ALL" ? o : { ...o, items: o.items.filter((i) => i.station === station) }))
        .filter((o) => o.items.length > 0),
    [orders, station],
  );
  const newOrders = visible.filter((o) => o.status === "PLACED");
  const inProgress = visible.filter((o) => o.status !== "PLACED");

  const counts: Record<StationFilter, number> = {
    ALL: orders.length,
    HOT: orders.filter((o) => o.items.some((i) => i.station === "HOT")).length,
    COLD: orders.filter((o) => o.items.some((i) => i.station === "COLD")).length,
    BAR: orders.filter((o) => o.items.some((i) => i.station === "BAR")).length,
  };

  const selectedId = visible.some((o) => o.id === picked) ? picked : (newOrders[0] ?? inProgress[0])?.id ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 4000);
  };

  const advance = async (order: Order) => {
    const step = NEXT_STEP[order.status];
    if (!step || busyId) return;
    setBusyId(order.id);
    try {
      upsert(await updateOrderStatus(token, order.id, step.to));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn’t update the ticket.");
    } finally {
      setBusyId(null);
    }
  };

  // Bump-bar keys: arrows move the selection, Enter or Space advances the selected ticket.
  const keyState = useRef({ newOrders, inProgress, selectedId, drawer, advance });
  useEffect(() => {
    keyState.current = { newOrders, inProgress, selectedId, drawer, advance };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = keyState.current;
      if (s.drawer || (e.target as HTMLElement).closest("input, textarea, select")) return;
      const lanes = [s.newOrders, s.inProgress];
      const lane = lanes.findIndex((l) => l.some((o) => o.id === s.selectedId));
      const idx = lane >= 0 ? lanes[lane].findIndex((o) => o.id === s.selectedId) : -1;
      const choose = (o?: Order) => o && setPicked(o.id);

      switch (e.key) {
        case "ArrowDown": e.preventDefault(); choose(lanes[Math.max(lane, 0)][Math.min(idx + 1, lanes[Math.max(lane, 0)].length - 1)]); break;
        case "ArrowUp": e.preventDefault(); choose(lanes[Math.max(lane, 0)][Math.max(idx - 1, 0)]); break;
        case "ArrowRight": case "ArrowLeft": {
          e.preventDefault();
          const target = lanes[e.key === "ArrowRight" ? 1 : 0];
          choose(target[Math.min(Math.max(idx, 0), target.length - 1)]);
          break;
        }
        case "Enter": case " ": {
          const order = [...s.newOrders, ...s.inProgress].find((o) => o.id === s.selectedId);
          if (order) {
            e.preventDefault();
            (document.activeElement as HTMLElement | null)?.blur?.(); // stop a focused button also firing its click
            void s.advance(order);
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clock = new Date(now).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  const ticket = (o: Order) => (
    <Ticket
      key={o.id}
      order={o}
      now={now}
      selected={o.id === selectedId}
      fresh={!!fresh[o.id]}
      busy={busyId === o.id}
      onSelect={() => setPicked(o.id)}
      onAdvance={() => void advance(o)}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-7">
          <div>
            <h1 className="text-xl font-bold">Kitchen Display</h1>
            <p className="text-xs text-muted">{user.name} · {user.role}</p>
          </div>
          <nav aria-label="Station" className="flex gap-2">
            {STATIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={station === s.value}
                onClick={() => setStation(s.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  station === s.value ? "bg-primary text-on-primary" : "bg-surface-2",
                )}
              >
                {s.label}
                <span className={cn("text-xs font-bold", station === s.value ? "text-on-primary" : "text-muted")}>{counts[s.value]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
            <span className={cn("size-[9px] rounded-full", status === "connected" ? "bg-success" : status === "connecting" ? "bg-warn" : "bg-danger")} />
            {status === "connected" ? "Connected" : status === "connecting" ? "Connecting…" : "Offline"}
          </span>
          <span className="text-base font-semibold tabular-nums">{clock}</span>
          <button
            type="button"
            aria-label={soundOn ? "Mute alerts" : "Turn on sound alerts"}
            aria-pressed={soundOn}
            onClick={() => { enableAudio(); setSoundOn((v) => !v); }}
            className="flex size-10 items-center justify-center rounded-full bg-surface-2"
          >
            {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5 text-muted" />}
          </button>
          <button type="button" onClick={() => setDrawer(true)} className="flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary">
            <Ban className="size-[18px]" /> 86 items
          </button>
          <button type="button" aria-label="Sign out" onClick={onLogout} className="flex size-10 items-center justify-center rounded-full bg-surface-2">
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      {bells.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-line bg-warn/10 px-6 py-2.5" role="status">
          {bells.map((b) => (
            <Chip key={b.id} tone="warn" className="gap-2 py-1.5 text-[13px] font-semibold">
              <Bell className="size-3.5" /> {b.text}
              <button type="button" aria-label="Dismiss" onClick={() => setBells((l) => l.filter((x) => x.id !== b.id))}><X className="size-3.5" /></button>
            </Chip>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-danger">{error.message}</p>
          <button type="button" onClick={() => void refetch()} className="rounded-xl border border-primary px-4 py-2 font-semibold text-primary">Try again</button>
        </div>
      ) : (
        <main className="grid flex-1 grid-cols-1 items-start gap-6 p-6 lg:grid-cols-[360px_1fr]">
          <section aria-label="New orders" className="flex flex-col gap-3.5">
            <h2 className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.08em] text-muted">
              NEW <Chip className="px-2.5 py-0.5 font-bold text-ink">{newOrders.length}</Chip>
            </h2>
            {newOrders.map(ticket)}
            {newOrders.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No new orders</p>}
          </section>

          <section aria-label="In progress" className="flex flex-col gap-3.5">
            <h2 className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.08em] text-muted">
              IN PROGRESS <Chip className="px-2.5 py-0.5 font-bold text-ink">{inProgress.length}</Chip>
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] items-start gap-4">
              {inProgress.map(ticket)}
            </div>
            {inProgress.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">Nothing in progress</p>}
            <div className="mt-2 w-fit rounded-2xl border border-line p-4">
              <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-muted">BUMP-BAR KEYS</p>
              <dl className="space-y-1.5 text-[13px]">
                {[["↑ ↓", "Select ticket"], ["← →", "Switch lane"], ["Enter / Space", "Advance ticket"]].map(([k, d]) => (
                  <div key={k} className="flex items-center gap-2.5"><dt><Chip tone="outline" className="bg-surface-2 font-bold">{k}</Chip></dt><dd className="text-muted">{d}</dd></div>
                ))}
              </dl>
            </div>
          </section>
        </main>
      )}

      {toast && (
        <div role="alert" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-danger px-5 py-3 text-sm font-semibold text-on-primary shadow-lg">
          {toast}
        </div>
      )}
      {drawer && <EightySixDrawer token={token} onClose={() => setDrawer(false)} />}
    </div>
  );
}
