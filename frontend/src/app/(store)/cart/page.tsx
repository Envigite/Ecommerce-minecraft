"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchCart } from "@/lib/api/cart";

export default function CartPage() {
  const { items, removeItem, addItem, clearCart, total } = useCartStore();
  const isAuth = useUserStore((s) => s.isAuthenticated);

  useEffect(() => {
    const syncCart = async () => {
      if (!isAuth) return;

      try {
        const data = await fetchCart();
        useCartStore.getState().setItems(data.items);
      } catch (err) {
        console.error("Error al obtener el carrito", err);
      }
    };
    syncCart();
  }, [isAuth]);

  const handleIncrease = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    addItem({ ...item, quantity: 1 });
  };

  const handleDecrease = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity === 1) {
      removeItem(id);
    } else {
      addItem({ ...item, quantity: -1 });
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Tu carrito está vacío.</p>
        <button
          onClick={() => (window.location.href = "/products")}
          className="text-sky-600 hover:underline font-medium cursor-pointer"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-6">Carrito de Compras</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-20 h-20 bg-slate-50 rounded-md shrink-0 border border-slate-100 flex items-center justify-center">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sin img</span>
                )}
              </div>

              <div>
                <h2 className="font-medium text-slate-900 line-clamp-1">
                  {item.name}
                </h2>
                <p className="text-slate-500 text-sm">
                  {formatCurrency(Number(item.price))}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleDecrease(item.id)}
                  className="px-3 py-1 hover:bg-slate-50 text-slate-600 transition"
                >
                  –
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleIncrease(item.id)}
                  className="px-3 py-1 hover:bg-slate-50 text-slate-600 transition"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-80px">
                <p className="font-semibold text-slate-900">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium mt-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-600">Subtotal</span>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(Number(total))}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={clearCart}
            className="px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200 text-sm transition cursor-pointer"
          >
            Vaciar carrito
          </button>
          <button className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition shadow-sm cursor-pointer">
            Proceder al Pago
          </button>
        </div>
      </div>
    </section>
  );
}
