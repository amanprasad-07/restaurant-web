import Link from "next/link";

// Demo launcher. In production the QR codes open /scan/<token> directly (see next.config.ts redirect).
const TABLES = [
  ["Table 1", "demo-table-1"],
  ["Table 2", "demo-table-2"],
  ["Table 3", "demo-table-3"],
  ["Table 4", "demo-table-4"],
  ["Patio 1", "demo-patio-1"],
  ["Bar Seat 1", "demo-bar-seat-1"],
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-6 py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">The Wooden Spoon</h1>
        <p className="text-muted">QR table ordering with a live kitchen display. Pick a table to play the guest, then open the kitchen screen in another window.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Guest · scan a table</h2>
        <ul className="grid grid-cols-2 gap-3">
          {TABLES.map(([label, token]) => (
            <li key={token}>
              <Link href={`/scan/${token}`} className="block rounded-2xl border border-line bg-surface px-4 py-3.5 font-semibold transition hover:border-primary">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Staff</h2>
        <Link href="/kds" className="block rounded-2xl bg-primary px-4 py-3.5 text-center font-bold text-on-primary">
          Open kitchen display
        </Link>
      </section>
    </main>
  );
}
