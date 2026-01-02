"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import { useUserStore } from "@/store/useUserStore";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  getAllOrdersAdminAPI,
  updateOrderStatusAPI,
  deleteOrderAPI,
} from "@/lib/api/orders";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/constants/orders";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, hasHydrated } = useUserStore();

  const isAdmin = user?.role === "admin";
  const canManage = user?.role === "admin" || user?.role === "manager";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const statusFilters = ["all", ...Object.values(ORDER_STATUS)];

  useEffect(() => {
    if (!hasHydrated) return;
    if (!canManage) router.replace("/admin/dashboard");
  }, [hasHydrated, canManage, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersAdminAPI(page, filterStatus, activeSearch);
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) fetchOrders();
  }, [page, filterStatus, activeSearch, canManage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (
      !confirm("¿Eliminar orden permanentemente? Esta acción es irreversible.")
    )
      return;

    setActionLoading(orderId);
    try {
      await deleteOrderAPI(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const style =
      ORDER_STATUS_COLORS[status as OrderStatus] ||
      "bg-slate-700 text-slate-300 border-slate-600";
    const label = ORDER_STATUS_LABELS[status as OrderStatus] || status;

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${style}`}
      >
        {label}
      </span>
    );
  };

  if (!hasHydrated || !canManage) return null;

  return (
    <section className="pb-10 min-h-screen">
      <div className="sticky z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-sm -mx-6 px-6 py-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Gestión de Órdenes
              </h1>
              <p className="text-sm text-slate-400">
                Mostrando página {page} de {totalPages}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilterStatus(f);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 text-sm cursor-pointer font-medium rounded-full transition border ${
                    filterStatus === f
                      ? "bg-sky-600 text-white border-sky-500 shadow"
                      : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  {f === "all"
                    ? "Todas"
                    : ORDER_STATUS_LABELS[f as OrderStatus]}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar ID (ej: a1b2c3d4)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg pl-3 pr-10 py-2 outline-none focus:border-sky-500 transition placeholder:text-slate-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="cursor-pointer absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </form>
          </div>

          {activeSearch && (
            <div className="text-xs text-sky-400 font-medium">
              Resultados para la búsqueda: &quot;{activeSearch}&quot;
            </div>
          )}
        </div>
      </div>

      {loading && (
        <p className="p-8 text-center text-slate-400 animate-pulse">
          Cargando órdenes...
        </p>
      )}

      {error && !loading && (
        <p className="p-8 text-center text-red-400 bg-red-900/10 border border-red-900/30 rounded-lg">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`font-mono text-xs block mb-1 ${
                        activeSearch && order.id.includes(activeSearch)
                          ? "text-sky-400 font-bold bg-sky-900/30 px-1 rounded w-fit"
                          : "text-slate-500"
                      }`}
                    >
                      #{order.id.substring(0, 8)}
                    </span>
                    <p className="font-semibold text-white mt-1">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="text-sm text-slate-300 space-y-1 mb-4">
                  <p>
                    <span className="text-slate-500">Cliente:</span>{" "}
                    {order.user_email}
                  </p>
                  <p>
                    <span className="text-slate-500">Fecha:</span>{" "}
                    {order.created_at
                      ? format(parseISO(order.created_at), "dd MMM yyyy", {
                          locale: es,
                        })
                      : "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">Items:</span>{" "}
                    {order.items_count}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Ver Detalles
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    disabled={!!actionLoading}
                    className="w-full bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded px-2 py-1.5 outline-none focus:border-sky-500 transition"
                  >
                    {Object.values(ORDER_STATUS).map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {ORDER_STATUS_LABELS[statusValue]}
                      </option>
                    ))}
                  </select>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={!!actionLoading}
                      className="w-full px-3 py-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded border border-red-800 text-xs font-medium transition cursor-pointer"
                    >
                      Eliminar Orden
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-hidden bg-slate-800 rounded-lg shadow border border-slate-700">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3">ID / Fecha</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`font-mono text-xs block mb-1 ${
                          activeSearch && order.id.includes(activeSearch)
                            ? "text-sky-400 font-bold"
                            : "text-slate-500"
                        }`}
                      >
                        #{order.id.substring(0, 8)}
                      </span>
                      <span className="text-slate-300">
                        {order.created_at
                          ? format(
                              parseISO(order.created_at),
                              "dd MMM, HH:mm",
                              { locale: es }
                            )
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {order.user_name || "Usuario"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.user_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(order.total_amount)}
                      <span className="block text-xs font-normal text-slate-500">
                        {order.items_count} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          title="Ver Detalle"
                          className="p-1.5 bg-slate-700 text-sky-400 hover:bg-slate-600 hover:text-white rounded border border-slate-600 transition cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                            <path
                              fillRule="evenodd"
                              d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 8.201 2.388 9.336 6.41.147.527.147 1.08 0 1.608C18.201 15.038 14.257 17.426 10 17.426c-4.257 0-8.201-2.388-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={!!actionLoading}
                          className="bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-sky-500 cursor-pointer"
                        >
                          {Object.values(ORDER_STATUS).map((statusValue) => (
                            <option key={statusValue} value={statusValue}>
                              {ORDER_STATUS_LABELS[statusValue]}
                            </option>
                          ))}
                        </select>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={!!actionLoading}
                            title="Eliminar"
                            className="p-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded border border-red-800 transition cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-800 border-dashed mt-4">
          {activeSearch
            ? `No se encontraron órdenes con el ID "${activeSearch}"`
            : "No se encontraron órdenes con estos filtros."}
        </div>
      )}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </section>
  );
}
