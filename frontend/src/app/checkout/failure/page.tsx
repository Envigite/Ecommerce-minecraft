"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailureContent() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get("external_reference") || searchParams.get("order_id");

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-ping"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10 text-red-600 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago Rechazado</h1>
      <p className="text-slate-500 mb-8 text-lg">
        Lo sentimos, no pudimos procesar tu pago. Por favor, intenta con otro
        método.
      </p>

      {orderId && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
            Referencia del intento
          </p>
          <p className="text-sm font-mono font-bold text-slate-700 break-all">
            {orderId}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Link
          href="/checkout"
          className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-slate-500/20"
        >
          Intentar pagar nuevamente
        </Link>

        <Link
          href="/cart"
          className="block w-full bg-white border-2 border-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:border-slate-300 hover:text-slate-800 transition"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px]">
      <Suspense fallback={<div>Cargando...</div>}>
        <FailureContent />
      </Suspense>
    </div>
  );
}
