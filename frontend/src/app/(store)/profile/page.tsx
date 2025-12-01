"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { fetchProfile } from "@/lib/api/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated, setUser } =
    useUserStore();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
      } catch (error: any) {
        console.error(error);
        if (error.message === "UNAUTHORIZED") {
          setServerError("Tu sesión expiró, inicia sesión nuevamente.");
          setTimeout(() => {
            logout();
            router.push("/login");
          }, 1500);
          return;
        }
        setServerError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, router, logout, hasHydrated, setUser]);

  if (!hasHydrated) return null;

  if (loading)
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Cargando perfil...
        </p>
      </div>
    );

  if (serverError)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center shadow-sm">
          <p className="font-medium">{serverError}</p>
        </div>
      </div>
    );

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
        <div className="h-24 w-24 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900">
            Hola, {user?.username}
          </h1>
          <p className="text-slate-500">Bienvenido a tu panel de control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Mis Datos</h2>
              <Link
                href="/profile/edit"
                className="text-sm text-sky-600 hover:text-sky-700 font-medium hover:underline"
              >
                Editar
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    Nombre de usuario
                  </p>
                  <p className="text-slate-900 font-medium">{user?.username}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    Correo Electrónico
                  </p>
                  <p className="text-slate-900 font-medium break-all">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full py-3 rounded-xl border cursor-pointer border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Mis Pedidos Recientes
            </h2>

            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-slate-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </div>
              <h3 className="text-slate-900 font-medium">
                Aún no has realizado pedidos
              </h3>
              <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs">
                Tus compras de cubos, herramientas y armaduras aparecerán aquí.
              </p>
              <Link
                href="/products"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-md"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
