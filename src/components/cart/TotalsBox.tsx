import { formatMoney } from "@/lib/utils/format";

export function TotalsBox({
  subtotal,
  tax,
  service,
  total,
  taxRate,
  serviceRate,
}: {
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  taxRate: number;
  serviceRate: number;
}) {
  const row = (label: string, value: number) => (
    <div className="flex justify-between text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{formatMoney(value, true)}</dd>
    </div>
  );
  return (
    <section aria-label="Order total" className="rounded-[18px] border border-line bg-surface p-4">
      <dl className="space-y-2.5">
        {row("Subtotal", subtotal)}
        {row(`Tax (${taxRate}%)`, tax)}
        {row(`Service charge (${serviceRate}%)`, service)}
        <div className="my-1 h-px bg-line" />
        <div className="flex justify-between text-[17px] font-bold">
          <dt>Total</dt>
          <dd>{formatMoney(total, true)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] leading-[15px] text-muted">
        Estimated. The final amount is confirmed by the kitchen when you place the order.
      </p>
    </section>
  );
}
