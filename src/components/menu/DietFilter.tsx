import { cn } from "@/lib/utils/format";

export type DietFilterValue = "ALL" | "VEG" | "NON_VEG" | "VEGAN";

const OPTIONS: { value: DietFilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-veg" },
  { value: "VEGAN", label: "Vegan" },
];

export function DietFilter({ value, onChange }: { value: DietFilterValue; onChange: (v: DietFilterValue) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto bg-surface px-5 py-3" role="group" aria-label="Dietary filter">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-[7px] text-[13px] transition",
            value === o.value ? "border-primary bg-primary font-semibold text-on-primary" : "border-line bg-surface font-medium",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
