import { cn } from "@/lib/utils/format";

export function CategoryTabs({
  categories,
  activeId,
}: {
  categories: { id: string; name: string }[];
  activeId: string | null;
}) {
  return (
    <nav aria-label="Menu categories" className="no-scrollbar flex gap-5 overflow-x-auto border-b border-line bg-surface px-5">
      {categories.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={cn(
              "shrink-0 border-b-2 py-2.5 text-sm whitespace-nowrap transition",
              active ? "border-primary font-semibold text-primary" : "border-transparent font-medium text-muted",
            )}
          >
            {c.name}
          </button>
        );
      })}
    </nav>
  );
}
