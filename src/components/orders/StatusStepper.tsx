import { Check } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils/format";

const STEPS = [
  { status: "PLACED", label: "Placed" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "PREPARING", label: "Preparing" },
  { status: "SERVED", label: "Served" },
] as const;

/** Placed → Accepted → Preparing → Served. Served/Closed show every step as done. */
export function StatusStepper({ status }: { status: OrderStatus }) {
  const done = status === "SERVED" || status === "CLOSED";
  const current = done ? STEPS.length : STEPS.findIndex((s) => s.status === status);

  return (
    <ol aria-label="Order progress" className="flex">
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center gap-1.5" aria-current={state === "current" ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-[3px] flex-1", i === 0 ? "bg-transparent" : i <= current ? "bg-primary" : "bg-line")} />
              <span
                className={cn(
                  "flex size-[22px] items-center justify-center rounded-full",
                  state === "done" && "bg-primary text-on-primary",
                  state === "current" && "border-2 border-primary bg-primary-soft",
                  state === "todo" && "border-[1.5px] border-line bg-surface-2",
                )}
              >
                {state === "done" && <Check className="size-3.5" strokeWidth={3} />}
                {state === "current" && <span className="size-2 rounded-full bg-primary" />}
              </span>
              <span className={cn("h-[3px] flex-1", i === STEPS.length - 1 ? "bg-transparent" : i < current ? "bg-primary" : "bg-line")} />
            </div>
            <span className={cn("text-[11px]", state === "current" ? "font-semibold" : "font-medium", state === "todo" ? "text-muted" : "text-ink")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
