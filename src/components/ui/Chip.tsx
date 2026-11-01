import { cn } from "@/lib/utils/format";

type Tone = "neutral" | "primary" | "solid" | "danger" | "warn" | "success" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary",
  solid: "bg-primary text-on-primary",
  danger: "bg-danger text-on-primary",
  warn: "bg-warn/15 text-warn",
  success: "bg-success/15 text-success",
  outline: "border border-line bg-surface text-ink",
};

export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
