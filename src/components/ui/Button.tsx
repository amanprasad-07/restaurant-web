import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/format";

type Variant = "primary" | "outline" | "danger" | "soft" | "success" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110",
  outline: "border border-primary bg-primary-soft text-primary hover:brightness-110",
  danger: "border border-danger text-danger hover:bg-danger/10",
  soft: "bg-surface-2 text-ink hover:brightness-95",
  success: "bg-success text-on-primary hover:brightness-110",
  ghost: "text-primary hover:bg-primary-soft",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  block?: boolean;
}

export function Button({ variant = "primary", loading, block, className, children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:border-transparent disabled:brightness-100",
        block && "w-full",
        VARIANTS[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
