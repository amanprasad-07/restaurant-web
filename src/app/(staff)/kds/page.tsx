"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { KdsBoard } from "@/components/kds/KdsBoard";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/lib/utils/useHydrated";

// S2: the kitchen board. Redirects to login when there is no staff token.
export default function KdsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (hydrated && !token) router.replace("/kds/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token || !user) return <FullScreenSpinner />;

  return (
    <KdsBoard
      token={token}
      user={user}
      onLogout={() => {
        signOut();
        router.replace("/kds/login");
      }}
    />
  );
}
