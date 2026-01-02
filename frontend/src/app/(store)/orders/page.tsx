"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyOrdersAPI } from "@/lib/api/orders";
import { formatCurrency } from "@/utils/formatCurrency";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersAPI()
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-20 text-center">Cargando historial...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/profile"
          className="p-2 rounded-full hover:bg-slate-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-slate-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Mis Pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 mb-4">No tienes pedidos aún.</p>
          <Link
            href="/products"
            className="text-sky-600 font-bold hover:underline"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="bg-slate-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-100">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Fecha</p>
                    <p className="font-medium text-slate-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Total</p>
                    <p className="font-medium text-slate-900">
                      {formatCurrency(Number(order.total_amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Estado</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.status === "paid" ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  ID:{" "}
                  <span className="font-mono text-xs">
                    {String(order.id).slice(0, 8)}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1 flex gap-4 overflow-x-auto pb-2 sm:pb-0">
                  {order.items.slice(0, 4).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 border rounded-lg bg-slate-50 shrink-0"
                    >
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 border rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition text-center"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
