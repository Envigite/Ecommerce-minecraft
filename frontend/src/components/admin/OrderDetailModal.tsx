"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getAdminOrderByIdAPI } from "@/lib/api/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
} from "@/constants/orders";

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailModal({
  orderId,
  onClose,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getAdminOrderByIdAPI(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchDetail();
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Detalle de Orden</h2>
            <p className="text-sm text-slate-400 font-mono">#{orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-slate-600 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
          ) : order ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Cliente
                  </p>
                  <p className="text-white font-medium">
                    {order.user_name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-slate-400 break-all">
                    {order.user_email || "Sin email"}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Pago
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium capitalize">
                      {order.payment_method === "mercadopago"
                        ? "Mercado Pago"
                        : "Efectivo/Transferencia"}
                    </span>
                  </div>
                  {order.payment_id && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Ref: {order.payment_id}
                    </p>
                  )}
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Estado
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                      ORDER_STATUS_COLORS[order.status as OrderStatus]
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status as OrderStatus] ||
                      order.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    {order.created_at &&
                      format(parseISO(order.created_at), "dd MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                  </p>
                </div>
              </div>

              {order.delivery_type === "shipping" && order.shipping_address ? (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                    📍 Dirección de Envío
                  </p>
                  <p className="text-slate-200">
                    {order.shipping_address.street} #
                    {order.shipping_address.number}
                  </p>
                  <p className="text-sm text-slate-400">
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.region}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                    🏪 Retiro en Tienda
                  </p>
                  <p className="text-sm text-slate-400">
                    El cliente retirará el pedido en el local.
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-white font-bold mb-4">
                  Productos ({order.items?.length || 0})
                </h3>
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800 text-slate-200 font-medium">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-center">Cant.</th>
                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900">
                      {order.items?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded shrink-0 relative overflow-hidden">
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                    IMG
                                  </div>
                                )}
                              </div>
                              <span className="text-slate-200 font-medium line-clamp-1">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-white">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Total a Pagar</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-red-400">
              No se encontró la información de la orden.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
