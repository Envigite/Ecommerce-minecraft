"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useUserStore();
  const clearCart = useCartStore((s) => s.clearCart);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      logout();
      clearCart();
      router.push("/");
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  const baseLinks = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/cart", label: "Carrito" },
  ];

  const authLinks = [
    { href: "/login", label: "Iniciar Sesión" },
    { href: "/register", label: "Regístrate" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <ResponsiveSidebar
          className="bg-white/95 backdrop-blur border-r border-slate-200 md:hidden pt-20"
          title="Menú Principal"
          buttonClassName="border border-slate-700 hover:bg-slate-800"
        >
          {({ close }) => (
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              {baseLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`block rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 ${
                    pathname === link.href
                      ? "text-sky-600 bg-slate-50"
                      : "text-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-slate-100"></div>

              {!isAuthenticated ? (
                authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={`block px-2 py-2 rounded-lg hover:bg-slate-100 ${
                      pathname === link.href
                        ? "text-sky-600 bg-slate-50"
                        : "text-slate-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={close}
                    className="text-sky-700 hover:text-sky-600 px-2 py-2 block rounded-lg hover:bg-slate-100"
                  >
                    {user?.username}
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      handleLogout();
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-2 font-semibold"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </nav>
          )}
        </ResponsiveSidebar>
        <Link
          href="/"
          className="text-lg font-semibold text-slate-900 md:pl-0 pl-12"
        >
          Fashion’t Park
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-sky-600 ${
                pathname === link.href
                  ? "text-sky-600 font-medium"
                  : "text-slate-700"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-sky-600 ${
                    pathname === link.href
                      ? "text-sky-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <Link href="/profile" className="text-sky-700 hover:text-sky-600">
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
