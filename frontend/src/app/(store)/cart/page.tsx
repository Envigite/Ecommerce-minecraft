"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchCart } from "@/lib/api/cart";

const SHIPPING_COST_VALUE = 3990;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deliveryType, setDeliveryType] = useState<"shipping" | "pickup">(
    "shipping"
  );

  useEffect(() => {
    setMounted(true);

    const syncCart = async () => {
      if (!isAuth) return;
      try {
        setLoading(true);
        const data = await fetchCart();
        if (data.items && data.items.length > 0) {
          useCartStore.getState().setItems(data.items);
        }
      } catch (err) {
        console.error("Error al sincronizar carrito", err);
      } finally {
        setLoading(false);
      }
    };
    syncCart();
  }, [isAuth]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shippingCost = deliveryType === "pickup" ? 0 : SHIPPING_COST_VALUE;
  const total = subtotal + shippingCost;

  const handleIncrease = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    updateQuantity(id, item.quantity + 1);
  };

  const handleDecrease = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity === 1) {
      removeItem(id);
    } else {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleBuyNow = () => {
    if (isAuth) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/cart");
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Sincronizando carrito...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Parece que aún no has agregado nada. Explora nuestras categorías y
          encuentra lo que buscas.
        </p>
        <Link
          href="/products"
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
        >
          Empezar a comprar
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Carrito de Compras ({items.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-6 flex flex-col sm:flex-row gap-6 ${
                  index !== items.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="relative w-full sm:w-28 h-28 bg-slate-50 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center">
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

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Precio unitario: {formatCurrency(Number(item.price))}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => handleDecrease(item.id)}
                        className="px-3 py-1 cursor-pointer text-slate-600 hover:bg-slate-100 transition border-r border-slate-300 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-medium text-slate-900 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item.id)}
                        className="px-3 py-1 cursor-pointer text-slate-600 hover:bg-slate-100 transition border-l border-slate-300 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer text-sm font-medium hover:underline transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="text-slate-500 hover:text-red-600 cursor-pointer text-sm font-medium flex items-center gap-2 transition ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            Vaciar todo el carrito
          </button>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Resumen de la orden
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">
                  Estimación de entrega
                </p>
                <div className="flex flex-col gap-2">
                  <label
                    className={`flex justify-between items-center p-2 rounded-lg border cursor-pointer text-sm ${
                      deliveryType === "shipping"
                        ? "bg-sky-50 border-sky-200"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartDelivery"
                        checked={deliveryType === "shipping"}
                        onChange={() => setDeliveryType("shipping")}
                        className="text-sky-600"
                      />
                      <span>Despacho a Domicilio</span>
                    </div>
                    <span className="font-bold">
                      {formatCurrency(SHIPPING_COST_VALUE)}
                    </span>
                  </label>

                  <label
                    className={`flex justify-between items-center p-2 rounded-lg border cursor-pointer text-sm ${
                      deliveryType === "pickup"
                        ? "bg-sky-50 border-sky-200"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartDelivery"
                        checked={deliveryType === "pickup"}
                        onChange={() => setDeliveryType("pickup")}
                        className="text-sky-600"
                      />
                      <span>Retiro en Tienda</span>
                    </div>
                    <span className="font-bold text-green-600">Gratis</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">
                  Total Estimado
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg transform active:scale-95 mb-4"
            >
              Continuar al Pago
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-slate-400 mb-2 font-medium">
                Pago 100% Seguro
              </p>
              <div className="flex justify-center gap-3">
                <div className="h-8 w-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                    alt="Visa"
                    className="h-3 object-contain"
                  />
                </div>
                <div className="h-8 w-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    alt="Mastercard"
                    className="h-4 object-contain"
                  />
                </div>
                <div className="h-8 w-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-slate-600"
                  >
                    <path d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.876.75.75 0 0 1-.351-.92Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
