"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopbar } from "./components/AdminTopbar";
import { logoutAPI } from "@/lib/api/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hasHydrated, user, logout: logoutZustand } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAdmin) {
      router.replace("/");
    }
  }, [hasHydrated, router, isAdmin]);

  if (!isMounted || !hasHydrated || !isAdmin) return null;

  const handleLogout = async () => {
    await logoutAPI();
    logoutZustand();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <AdminSidebar onLogout={handleLogout} />

      <div className="md:pl-48 lg:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-700 h-16 flex items-center">
          <AdminTopbar />
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
