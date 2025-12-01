import { CartItem } from "@/types/cart";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchCart = async () => {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener el carrito");
  }

  return res.json();
};

export const mergeCart = async (items: CartItem[]) => {
  const res = await fetch(`${BASE_URL}/api/cart/merge`, {
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

export const addToCartAPI = async (productId: string, quantity: number) => {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!res.ok) throw new Error("Error al agregar al carrito");
  return res.json();
};

export const removeFromCartAPI = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/cart/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 404) return true;
  if (!res.ok) throw new Error("Error al eliminar del carrito");
  return true;
};

export const clearCartAPI = async () => {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 404) return true;
  if (!res.ok) throw new Error("Error al vaciar el carrito");
  return true;
};

export const updateCartItemAPI = async (productId: string, quantity: number) => {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ product_id: productId, quantity }),
  });

  if (!res.ok) throw new Error("Error al actualizar carrito");
  return res.json();
};