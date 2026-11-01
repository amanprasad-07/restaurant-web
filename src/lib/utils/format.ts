import clsx, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

// The demo restaurant is INR. For multi-currency, use restaurant.currency with Intl.NumberFormat.
export function formatMoney(amount: number, alwaysDecimals = false): string {
  const decimals = alwaysDecimals || !Number.isInteger(amount) ? 2 : 0;
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

/** 0:42, 12:40 */
export function formatAge(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
