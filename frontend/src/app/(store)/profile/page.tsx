"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { getMyOrdersAPI } from "@/lib/api/orders";
import { formatCurrency } from "@/utils/formatCurrency";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated, setUser, checkAuth } =
    useUserStore();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      checkAuth().then(() => {
        if (!useUserStore.getState().isAuthenticated) {
          router.push("/login");
        }
      });
    }
  }, [hasHydrated, isAuthenticated, router, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (dataFetchedRef.current) return;

    dataFetchedRef.current = true;

    checkAuth().catch((err) => console.warn("Error background refresh:", err));
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersAPI();
        setOrders(data);
      } catch (error) {
        console.error("Error cargando órdenes", error);
        setServerError(
          "Hubo un problema al cargar tu historial. Intenta recargar la página."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      paid: "Pagado",
      pending: "Pendiente",
      shipped: "Enviado",
      delivered: "Entregado",
    };
    return map[status] || status;
  };

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

  const hasAddresses = user?.addresses && user.addresses.length > 0;
  const hasCards = user?.cards && user.cards.length > 0;

  if (!hasHydrated) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="h-24 w-24 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white ring-1 ring-slate-100">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-slate-900">
            Hola, {user?.username}
          </h1>
          <p className="text-slate-500 mt-1">
            Bienvenido a tu panel de control
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="cursor-pointer px-5 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition font-medium text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Mis Datos</h2>
              <Link
                href="/profile/edit"
                className="text-sm text-sky-600 hover:underline font-medium"
              >
                Editar
              </Link>
            </div>
            <div className="space-y-4">
              <div className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
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
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Usuario
                  </p>
                  <p className="text-slate-900 font-medium">{user?.username}</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
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
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Email
                  </p>
                  <p className="text-slate-900 font-medium truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Direcciones</h2>
              <Link
                href="/profile/edit?tab=addresses"
                className="text-sm text-sky-600 hover:underline font-medium"
              >
                Gestionar
              </Link>
            </div>
            {!hasAddresses ? (
              <p className="text-sm text-slate-400 italic">
                No tienes direcciones guardadas.
              </p>
            ) : (
              <div className="space-y-3">
                {user?.addresses?.slice(0, 2).map((addr) => (
                  <div
                    key={addr.id}
                    className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {addr.alias}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {addr.street} {addr.number}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Tarjetas</h2>
              <Link
                href="/profile/edit?tab=cards"
                className="text-sm text-sky-600 hover:underline font-medium"
              >
                Gestionar
              </Link>
            </div>
            {!hasCards ? (
              <p className="text-sm text-slate-400 italic">
                No tienes tarjetas guardadas.
              </p>
            ) : (
              <div className="space-y-3">
                {user?.cards?.slice(0, 2).map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm capitalize">
                        {card.brand} •••• {card.last4}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Pedidos Recientes
                </h2>
                <p className="text-sm text-slate-500">
                  Últimos movimientos de tu cuenta
                </p>
              </div>
              {orders.length > 0 && (
                <Link
                  href="/orders"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Ver todo el historial
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
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
                  Aún no tienes pedidos
                </h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">
                  Empieza a comprar tu equipamiento.
                </p>
                <Link
                  href="/products"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-md"
                >
                  Ir a la Tienda
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="group border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            #{order.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "es-CL",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.items.length} productos
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 py-3 border-t border-slate-100 overflow-x-auto">
                      {order.items.slice(0, 4).map((item: any, i: number) => (
                        <div
                          key={i}
                          className="relative w-12 h-12 bg-white rounded-lg border border-slate-200 shrink-0 p-1"
                          title={item.name}
                        >
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                              ?
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center text-xs font-medium text-slate-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center text-sm font-bold text-sky-600 hover:text-sky-700"
                      >
                        Ver detalles
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 ml-1"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}

                <Link
                  href="/orders"
                  className="block w-full py-3 text-center text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition mt-4"
                >
                  Ver todos los pedidos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
