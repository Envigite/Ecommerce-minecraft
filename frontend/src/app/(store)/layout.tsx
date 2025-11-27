"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();

  const isAdmin = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isAdmin, router]);

  if (!hasHydrated) return null;
  if (isAuthenticated && isAdmin) return null;

  return <LayoutWrapper>{children}</LayoutWrapper>;
}
