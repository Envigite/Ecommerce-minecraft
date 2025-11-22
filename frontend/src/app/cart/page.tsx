"use client";

import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function CartPage() {
  const { items, removeItem, addItem, clearCart, total } = useCartStore();
  const isAuth = useUserStore((s) => s.isAuthenticated);

  useEffect(() => {
    const syncCart = async () => {
      if (!isAuth) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      useCartStore.getState().setItems(data.items);
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
      const updated = { ...item, quantity: -1 };
      addItem(updated);
    }
  };

  if (items.length === 0)
    return <p className="text-slate-600">Tu carrito está vacío.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Carrito</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center gap-4">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-contain bg-white"
                />
              )}
              <div>
                <h2 className="font-medium">{item.name}</h2>
                <p className="text-slate-600">
                  {formatCurrency(Number(item.price))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrease(item.id)}
                className="px-2 py-0.3 border rounded"
              >
                –
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleIncrease(item.id)}
                className="px-2 py-0.3 border rounded"
              >
                +
              </button>
              <p className="w-20 text-right">
                {formatCurrency(Number(item.price) * item.quantity)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <button
          onClick={clearCart}
          className="text-slate-600 hover:text-red-600 text-sm"
        >
          Vaciar carrito
        </button>
        <p className="text-lg font-semibold">
          Total: {formatCurrency(Number(total))}
        </p>
      </div>
    </section>
  );
}
