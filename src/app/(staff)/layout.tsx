// Everything under /staff uses the dark "kitchen" palette (variables swapped in globals.css).
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="kitchen" className="min-h-dvh bg-canvas text-ink">
      {children}
    </div>
  );
}
