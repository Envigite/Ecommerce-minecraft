"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopbar } from "./components/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hasHydrated, user } = useUserStore();

  const isAdmin = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAdmin) {
      router.replace("/");
    }
  }, [hasHydrated, router, isAdmin]);

  if (!hasHydrated) return null;
  if (!isAdmin) return null;

  const logout = () => {
    useUserStore.getState().logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <AdminSidebar onLogout={logout} />

      <div className="flex-1 ml-0 md:ml-48 lg:ml-64">
        <div className="fixed top-0 left-0 md:left-48 lg:left-64 right-0 text-end z-30">
          <AdminTopbar />
        </div>
        <main className="p-6 mt-8 bg-slate-900">{children}</main>
      </div>
    </div>
  );
}
