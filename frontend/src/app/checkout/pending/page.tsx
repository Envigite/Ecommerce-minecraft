"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

function PendingContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const orderId =
    searchParams.get("order_id") || searchParams.get("external_reference");

  useEffect(() => {
    if (orderId) clearCart();
  }, [orderId, clearCart]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10 text-orange-600 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago Pendiente</h1>
      <p className="text-slate-500 mb-8 text-lg">
        Estamos esperando la confirmación de tu pago. Esto puede tardar unos
        minutos.
      </p>

      <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 mb-8 text-left">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-orange-600"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-orange-900 font-medium mb-1">
              Tu orden ha sido reservada
            </p>
            <p className="text-xs text-orange-700/80 mb-2">
              Te notificaremos por correo cuando se acredite el pago.
            </p>
            {orderId && (
              <p className="text-xs font-mono font-bold text-orange-800 bg-white/50 px-2 py-1 rounded inline-block">
                ID: {orderId}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/profile"
          className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-slate-500/20"
        >
          Ver mis compras
        </Link>
        <Link
          href="/products"
          className="block w-full bg-white border-2 border-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px]">
      <Suspense fallback={<div>Cargando...</div>}>
        <PendingContent />
      </Suspense>
    </div>
  );
}
