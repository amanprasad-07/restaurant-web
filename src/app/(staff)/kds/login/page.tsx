"use client";

import { ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/store";
import { ApiError } from "@/lib/api/client";
import { staffLogin } from "@/lib/api/staff";

// Seeded demo accounts (backend prisma/seed.ts). Handy for demos; remove for a real deployment.
const DEMO = [
  ["Chef", "chef@demobistro.test"],
  ["Captain", "captain@demobistro.test"],
  ["Admin", "admin@demobistro.test"],
] as const;

// S1: staff sign-in
export default function KdsLoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await staffLogin(email.trim(), password);
      if (res.user.role === "WAITER") {
        setError("This screen is for kitchen staff. Waiters use the floor terminal.");
        return;
      }
      signIn(res.accessToken, res.user);
      router.replace("/kds");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError("Wrong email or password.");
      else if (err instanceof ApiError && err.status === 429) setError("Too many attempts. Wait a minute and try again.");
      else setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const field = "h-12 w-full rounded-xl border border-line bg-surface px-4 outline-none focus:border-primary";

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl border border-line bg-surface p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
            <ChefHat className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Kitchen Display</h1>
          <p className="text-sm text-muted">Sign in with your staff account</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </div>

        {error && <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" block loading={busy}>Sign in</Button>

        <div className="space-y-2 border-t border-line pt-4">
          <p className="text-center text-xs text-muted">Demo accounts (password: Password123!)</p>
          <div className="flex justify-center gap-2">
            {DEMO.map(([label, mail]) => (
              <button
                key={mail}
                type="button"
                onClick={() => { setEmail(mail); setPassword("Password123!"); }}
                className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium hover:brightness-125"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </main>
  );
}
