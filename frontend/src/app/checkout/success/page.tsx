"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getOrderByIdAPI } from "@/lib/api/orders";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/formatCurrency";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const orderId =
    searchParams.get("order_id") || searchParams.get("external_reference");

  const mpStatus =
    searchParams.get("status") || searchParams.get("collection_status");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        clearCart();

        const data = await getOrderByIdAPI(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error cargando orden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
        <p>Verificando tu compra...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Orden no encontrada
        </h1>
        <p className="text-slate-500 mb-4">
          No pudimos cargar los detalles, pero si te llegó el correo de
          confirmación, todo está bien.
        </p>
        <Link href="/" className="text-sky-600 underline">
          Volver al inicio
        </Link>
      </div>
    );
  }
  const validStatuses = [
    "paid",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "approved",
  ];

  const isSuccess =
    validStatuses.includes(order.status) || mpStatus === "approved";

  if (!isSuccess) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-200 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Pago en revisión
        </h1>
        <p className="text-slate-500 mb-6">
          Tu orden se generó con estado <strong>{order.status}</strong>. Si
          pagaste, te notificaremos cuando se acredite.
        </p>
        <Link
          href="/profile"
          className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl"
        >
          Ver mis compras
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-12 h-12 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-slate-500 mb-8 text-lg">
        Tu pedido ha sido confirmado exitosamente.
      </p>

      <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-200">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-slate-500">N° de Orden:</span>
          <span className="font-mono font-bold text-slate-900">
            #{order.id.substring(0, 8)}
          </span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-slate-500">Fecha:</span>
          <span className="font-medium text-slate-900">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
          <span className="text-slate-900 font-bold">Total Pagado:</span>
          <span className="font-bold text-sky-600 text-lg">
            {formatCurrency(order.total_amount || order.total)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/profile"
          className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-slate-500/20"
        >
          Ver estado de mi pedido
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

export default function SuccessPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px]">
      <Suspense fallback={<div>Cargando resultado...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
