"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StaffUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: StaffUser | null;
  signIn: (token: string, user: StaffUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (token, user) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
    }),
    { name: "rq-staff", storage: createJSONStorage(() => sessionStorage) },
  ),
);
