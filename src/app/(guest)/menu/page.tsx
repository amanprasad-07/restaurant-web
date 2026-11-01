"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartBar } from "@/components/cart/CartBar";
import { NoSession } from "@/components/guest/NoSession";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { DietFilter, type DietFilterValue } from "@/components/menu/DietFilter";
import { ItemCard } from "@/components/menu/ItemCard";
import { ItemSheet } from "@/components/menu/ItemSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { useCartStore } from "@/features/cart/store";
import { useMenu } from "@/features/menu/useMenu";
import { useSessionStore } from "@/features/session/store";
import { ApiError } from "@/lib/api/client";
import { useSocketStatus } from "@/lib/sockets/hooks";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils/format";
import { useHydrated } from "@/lib/utils/useHydrated";

const matchesDiet = (item: MenuItem, diet: DietFilterValue) =>
  diet === "ALL" ||
  (diet === "VEG" && (item.dietaryType === "VEG" || item.dietaryType === "VEGAN")) ||
  item.dietaryType === diet;

// G2 + G3: browse the live menu, open the item sheet, fill the cart.
export default function MenuPage() {
  const hydrated = useHydrated();
  const token = useSessionStore((s) => s.sessionToken);
  const restaurant = useSessionStore((s) => s.restaurant);
  const table = useSessionStore((s) => s.table);
  const addToCart = useCartStore((s) => s.add);
  const menu = useMenu();
  const socketStatus = useSocketStatus(token);

  const [diet, setDiet] = useState<DietFilterValue>("ALL");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu.data ?? [])
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) => matchesDiet(i, diet) && (!q || i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [menu.data, diet, query]);

  // scroll-spy: highlight the category tab for the section near the top of the screen
  const idsKey = visible.map((c) => c.id).join(",");
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-cat]");
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveCat(e.target.getAttribute("data-cat"))),
      { rootMargin: "-170px 0px -65% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [idsKey]);

  if (!hydrated) return <FullScreenSpinner />;
  if (!token || !restaurant) return <NoSession />;

  if (menu.error instanceof ApiError && menu.error.status === 401) {
    return <NoSession message="Your table session has ended. Scan the QR code again to keep ordering." />;
  }

  const quickAdd = (item: MenuItem) =>
    addToCart({
      menuItemId: item.id,
      name: item.name,
      dietaryType: item.dietaryType,
      unitPrice: item.price,
      quantity: 1,
      modifiers: [],
      prepNotes: "",
    });

  return (
    <>
      <div className="sticky top-0 z-20">
        <header className="flex items-center justify-between bg-surface px-5 pt-12 pb-1.5">
          {searching ? (
            <div className="flex w-full items-center gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes"
                aria-label="Search dishes"
                className="h-10 flex-1 rounded-full bg-surface-2 px-4 text-sm outline-none"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => { setSearching(false); setQuery(""); }}
                className="flex size-10 items-center justify-center rounded-full bg-surface-2"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[22px] font-bold">{restaurant.name}</h1>
                <div className="flex items-center gap-2">
                  {table && <Chip tone="primary" className="font-semibold">{table.tableNumber}</Chip>}
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <span
                      className={cn(
                        "size-[7px] rounded-full",
                        socketStatus === "connected" ? "bg-success" : socketStatus === "connecting" ? "bg-warn" : "bg-danger",
                      )}
                    />
                    {socketStatus === "connected" ? "Live menu" : socketStatus === "connecting" ? "Connecting…" : "Offline"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearching(true)}
                className="flex size-10 items-center justify-center rounded-full bg-surface-2"
              >
                <Search className="size-5" />
              </button>
            </>
          )}
        </header>
        <DietFilter value={diet} onChange={setDiet} />
        <CategoryTabs categories={visible} activeId={activeCat ?? visible[0]?.id ?? null} />
      </div>

      <main className="flex-1 px-5 pt-4 pb-4">
        {menu.isLoading && <FullScreenSpinner />}
        {menu.error && !(menu.error instanceof ApiError && menu.error.status === 401) && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-muted">{menu.error.message}</p>
            <Button variant="outline" onClick={() => menu.refetch()}>Try again</Button>
          </div>
        )}
        {menu.data && visible.length === 0 && (
          <p className="py-16 text-center text-muted">Nothing matches your filters.</p>
        )}

        {visible.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} data-cat={cat.id} className="mb-5 scroll-mt-44">
            <h2 className="mb-3 text-lg font-bold">{cat.name}</h2>
            <div className="flex flex-col gap-3">
              {cat.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpen={() => setSelected(item)}
                  onQuickAdd={() => (item.modifierGroups.some((g) => g.required) ? setSelected(item) : quickAdd(item))}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="pt-2 text-center text-xs text-muted">
          Ordered already? <Link href="/orders" className="font-semibold text-primary">Track your orders</Link>
        </p>
      </main>

      <CartBar />

      {selected && (
        <ItemSheet
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={(line) => {
            addToCart(line);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
