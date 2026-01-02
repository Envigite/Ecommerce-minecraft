"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function AuthInitializer() {
  const { checkAuth, hasHydrated } = useUserStore();

  useEffect(() => {
    if (hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  return null;
}
