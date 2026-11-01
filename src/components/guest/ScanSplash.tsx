"use client";

import { QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export interface ScanProblem {
  title: string;
  detail: string;
  retry: boolean;
}

/** G1 visuals. Also used as the Suspense fallback while the URL token is being read. */
export function ScanSplash({ problem, onRetry }: { problem?: ScanProblem | null; onRetry?: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-between px-6 pt-16 pb-10">
      <span aria-hidden />
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-primary-soft">
          <QrCode className="size-11 text-primary" />
        </div>
        {problem ? (
          <>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="max-w-[28ch] text-muted">{problem.detail}</p>
            {problem.retry && onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="size-4" /> Try again
              </Button>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Welcome</h1>
            <div className="space-y-1.5">
              <p className="font-medium">Setting up your table…</p>
              <p className="text-sm text-muted">No account needed</p>
            </div>
            <Spinner />
          </>
        )}
      </div>
      <div className="text-center text-[13px]">
        <p className="font-medium">Trouble scanning?</p>
        <p className="text-muted">Ask your server and we’ll sort it out.</p>
      </div>
    </main>
  );
}
