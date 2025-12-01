"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();

  const [isMounted, setIsMounted] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isAdmin, router]);

  if (!isMounted || !hasHydrated) return null;
  if (isAuthenticated && isAdmin) return null;

  return <LayoutWrapper>{children}</LayoutWrapper>;
}
