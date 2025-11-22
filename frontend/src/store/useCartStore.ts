import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { useUserStore } from "@/store/useUserStore";


interface CartState {
  items: CartItem[];
  total: number;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  
  setItems: (items: CartItem[]) => void;
  setTotal: (total: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  total: 0,

  addItem: async (item) => {
  const isAuth = useUserStore.getState().isAuthenticated;
  const items = get().items;
  const existing = items.find((i) => i.id === item.id);

  let updated;

  if (existing) {
    updated = items.map((i) =>
      i.id === item.id
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  } else {
    updated = [...items, item];
  }

  const total = updated.reduce((acc, i) => acc + i.price * i.quantity, 0);
  set({ items: updated, total });
  if (!isAuth) return;

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: item.id,
      quantity: item.quantity,
    }),
  });
},


  removeItem: async (id) => {
  const isAuth = useUserStore.getState().isAuthenticated;

  const updated = get().items.filter((i) => i.id !== id);
  const total = updated.reduce((acc, i) => acc + i.price * i.quantity, 0);

  set({ items: updated, total });

  if (!isAuth) return;

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
},


  setItems: (items: CartItem[]) => {
    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    set({ items, total });
  },

  setTotal: (total: number) => set({ total }),

  clearCart: async () => {
  const isAuth = useUserStore.getState().isAuthenticated;

  set({ items: [], total: 0 });

  if (!isAuth) return;

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/clear`, {
    method: "DELETE",
    credentials: "include",
  });
},

}),
    { name: "cart-store" }
));
