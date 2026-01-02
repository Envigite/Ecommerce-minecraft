"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { HamburgerButton } from "@/components/HamburgerButton";

export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const { user } = useUserStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  const SidebarLinks = ({ close }: { close?: () => void }) => (
    <nav className="flex-1 space-y-3">
      <a
        href="/admin/dashboard"
        onClick={close}
        className="block hover:underline p-2 rounded hover:bg-slate-800 transition-colors"
      >
        Dashboard
      </a>
      <a
        href="/admin/products"
        onClick={close}
        className="block hover:underline p-2 rounded hover:bg-slate-800 transition-colors"
      >
        Productos
      </a>
      <a
        href="/admin/orders"
        onClick={close}
        className="block hover:underline p-2 rounded hover:bg-slate-800 transition-colors"
      >
        Ventas
      </a>

      {user?.role === "admin" && (
        <>
          <a
            href="/admin/users"
            onClick={close}
            className="block hover:underline p-2 rounded hover:bg-slate-800 transition-colors"
          >
            Usuarios
          </a>
          <a
            href="/admin/activity"
            onClick={close}
            className="block hover:underline p-2 rounded hover:bg-slate-800 transition-colors"
          >
            Historial
          </a>
        </>
      )}
    </nav>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-60">
        <HamburgerButton
          isOpen={isSidebarOpen}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="[&_span]:bg-white"
        />
      </div>

      <ResponsiveSidebar
        title="Panel Admin"
        className="bg-slate-900 text-white border-r border-slate-700 md:hidden pt-20"
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      >
        {({ close }) => (
          <>
            <SidebarLinks close={close} />
            <button
              onClick={onLogout}
              className="mt-auto bg-red-600 hover:bg-red-700 w-full py-2 rounded cursor-pointer transition-colors mb-4"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </ResponsiveSidebar>

      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 md:w-48 lg:w-64 bg-slate-900 text-white border-r border-slate-700 p-4 z-40">
        <h2 className="text-xl font-semibold mb-6 pl-2">Panel Admin</h2>
        <SidebarLinks />

        <button
          onClick={onLogout}
          className="mt-auto bg-red-700 hover:bg-red-800 w-full py-2 rounded cursor-pointer transition-colors mb-8"
        >
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
