"use client";

import { useUserStore } from "@/store/useUserStore";

export function AdminTopbar() {
  const user = useUserStore((s) => s.user);

  return (
    <header className="bg-slate-800 p-4">
      <p className="opacity-90">Sesión: {user?.username}</p>
    </header>
  );
}
