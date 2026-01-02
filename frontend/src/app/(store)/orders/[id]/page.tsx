"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrderByIdAPI } from "@/lib/api/orders";
import { formatCurrency } from "@/utils/formatCurrency";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderByIdAPI(id as string)
      .then((data) => {
        if (!data) router.push("/orders");
        setOrder(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading)
    return <div className="p-20 text-center">Cargando pedido...</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/orders"
        className="inline-flex items-center text-sm text-slate-500 hover:text-sky-600 mb-6 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 mr-1"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        Volver a mis pedidos
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pedido #{String(order.id).slice(0, 8)}
            </h1>
            <p className="text-slate-500 text-sm">
              Realizado el{" "}
              {new Date(order.created_at).toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.status === "paid" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                Pagado
              </span>
            )}
            <a
              href="#"
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Descargar Factura
            </a>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="font-bold text-slate-900 text-lg">
              Artículos del pedido
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-4 py-4 border-b border-slate-100 last:border-0"
                >
                  <div className="relative w-20 h-20 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-300">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Cantidad: {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(order.total_amount))}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-slate-900 text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total_amount))}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-3">
                Dirección de envío
              </h3>
              {order.shipping_address ? (
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    {order.shipping_address.street}{" "}
                    {order.shipping_address.number}
                  </p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.region}
                  </p>
                  <p>Chile</p>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  Retiro en tienda (Pickup)
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-3">Método de pago</h3>
              <div className="flex items-center gap-2 text-sm text-slate-700 capitalize">
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
                {order.payment_method === "cash"
                  ? "Efectivo / Transferencia"
                  : "Tarjeta de Crédito/Débito"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
