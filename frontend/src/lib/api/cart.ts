import { CartItem } from "@/types/cart";

export const fetchCart = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener el carrito");
  }

  return res.json();
};

export const mergeCart = async (items: CartItem[]) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error("Error al sincronizar el carrito");
  }

  return res.json();
};