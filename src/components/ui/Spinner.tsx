import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/format";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-label="Loading" className={cn("size-8 animate-spin text-primary", className)} />;
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner />
    </div>
  );
}
