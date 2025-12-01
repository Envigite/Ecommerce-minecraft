"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { useEffect, useState } from "react";
import ShopSearchBar from "./ShopSearchBar";
import { CATEGORY_HIERARCHY } from "@/utils/categories";
import { logoutAPI } from "@/lib/api/auth";
import MobileCategoryItem from "./MobileCategoryItem";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useUserStore();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const totalItems = mounted
    ? items.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const handleLogout = async () => {
    await logoutAPI();
    logout();
    clearCart();
    router.push("/");
  };

  const CartIcon = () => (
    <Link href="/cart" className="relative group p-2 m-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-slate-700 group-hover:text-sky-600 transition"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
          {totalItems}
        </span>
      )}
    </Link>
  );

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm w-full"
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex md:hidden justify-between items-center w-full">
          <div className="flex items-center">
            <ResponsiveSidebar
              className="bg-white/95 backdrop-blur border-r border-slate-200 md:hidden pt-20 w-[85vw] max-w-sm"
              title="Menú"
              buttonClassName="p-2 text-slate-700 hover:bg-slate-100 rounded focus:outline-none"
            >
              {({ close }) => (
                <div className="flex flex-col h-full overflow-y-auto pb-20 px-2">
                  <div className="mb-4">
                    <ShopSearchBar />
                  </div>

                  <nav className="space-y-1 mb-4">
                    <Link
                      href="/"
                      onClick={close}
                      className={`block px-3 py-2 rounded-lg font-medium ${
                        pathname === "/"
                          ? "bg-sky-50 text-sky-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Inicio
                    </Link>
                    <Link
                      href="/products"
                      onClick={close}
                      className={`block px-3 py-2 rounded-lg font-medium ${
                        pathname === "/products"
                          ? "bg-sky-50 text-sky-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Ver todos los productos
                    </Link>
                  </nav>

                  <hr className="border-slate-100 mb-4 bg-sky-900" />

                  <div className="mb-6">
                    <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Categorías
                    </p>
                    <div className="space-y-1">
                      {CATEGORY_HIERARCHY.map((cat) => (
                        <MobileCategoryItem
                          key={cat.slug}
                          cat={cat}
                          close={close}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {!isAuthenticated ? (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/login"
                          onClick={close}
                          className="w-full text-center py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium shadow-sm"
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          href="/register"
                          onClick={close}
                          className="w-full text-center py-2 bg-sky-600 text-white rounded-lg font-medium shadow-sm"
                        >
                          Regístrate
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold border border-sky-200">
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {user?.username}
                            </p>
                            <Link
                              href="/profile"
                              onClick={close}
                              className="text-xs text-sky-600 hover:underline block"
                            >
                              Ver mi perfil
                            </Link>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            close();
                            handleLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ResponsiveSidebar>
          </div>

          <Link
            href="/"
            className="text-lg font-bold text-slate-900 tracking-tight"
          >
            Fashion’t Park
          </Link>

          <div className="flex items-center">
            <CartIcon />
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between gap-8">
          <Link
            href="/"
            className="text-2xl font-bold text-slate-900 tracking-tight shrink-0"
          >
            Fashion’t Park
          </Link>

          <div className="flex-1 max-w-2xl">
            <ShopSearchBar />
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition group"
              >
                <div className="p-2 bg-slate-100 rounded-full group-hover:bg-sky-50 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium leading-none">Cuenta</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ingresar</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href="/profile"
                  className="font-medium text-slate-700 hover:text-sky-600"
                >
                  {user?.username}
                </Link>
                <div className="h-4 w-px bg-slate-300"></div>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 transition text-sm font-semibold cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Menu expandible Escritorio */}
      <div className="hidden md:block border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex items-center gap-8">
            {CATEGORY_HIERARCHY.map((cat) => (
              <div key={cat.slug} className="group relative">
                <Link
                  href={`/products?group=${cat.slug}`}
                  className="flex items-center gap-1 py-3 text-sm font-medium text-slate-600 hover:text-sky-600 border-b-2 border-transparent hover:border-sky-600 transition-colors"
                >
                  {cat.name}
                  <svg
                    className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-4 grid grid-cols-1 gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Subcategorías
                    </p>
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/products?category=${sub}`}
                        className="text-sm text-slate-600 hover:text-sky-600 hover:bg-slate-50 px-2 py-1.5 rounded transition capitalize"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
