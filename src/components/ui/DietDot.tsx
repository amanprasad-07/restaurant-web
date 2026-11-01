import type { DietaryType } from "@/lib/types";
import { cn } from "@/lib/utils/format";

/** The green/red square used on Indian menus. Vegan shares the green mark. */
export function DietDot({ type }: { type: DietaryType | null }) {
  if (!type) return null;
  const veg = type !== "NON_VEG";
  return (
    <span
      role="img"
      aria-label={type === "NON_VEG" ? "Non-vegetarian" : type === "VEGAN" ? "Vegan" : "Vegetarian"}
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border-[1.5px]",
        veg ? "border-veg" : "border-nonveg",
      )}
    >
      <span className={cn("size-1.5 rounded-full", veg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}
