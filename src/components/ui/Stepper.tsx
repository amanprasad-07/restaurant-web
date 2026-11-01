import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/format";

/** − 2 +  pill used in the item sheet and the cart. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "flex items-center justify-center rounded-full bg-surface text-ink transition active:scale-95 disabled:opacity-40",
    size === "md" ? "size-[34px]" : "size-7",
  );
  return (
    <div className={cn("inline-flex items-center rounded-full bg-surface-2", size === "md" ? "gap-3.5 p-1.5" : "gap-2.5 p-1")}>
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className={size === "md" ? "size-[18px]" : "size-3.5"} />
      </button>
      <span className={cn("min-w-4 text-center font-bold tabular-nums", size === "md" ? "text-[17px]" : "text-[13px]")}>{value}</span>
      <button type="button" aria-label="Increase quantity" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className={size === "md" ? "size-[18px]" : "size-3.5"} />
      </button>
    </div>
  );
}
