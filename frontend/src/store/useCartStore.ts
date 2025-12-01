import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { useUserStore } from "@/store/useUserStore";
import { addToCartAPI, removeFromCartAPI, clearCartAPI, updateCartItemAPI } from "@/lib/api/cart";

interface CartState {
  items: CartItem[];
  total: number;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  
  updateQuantity: (id: string, quantity: number) => void;

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

        if (isAuth) {
          try {
            await addToCartAPI(item.id, item.quantity);
          } catch (error) {
            console.error("Error syncing add to cart:", error);
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const isAuth = useUserStore.getState().isAuthenticated;
        const items = get().items;

        if (quantity < 1) return;

        const updated = items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        );
        const total = updated.reduce((acc, i) => acc + i.price * i.quantity, 0);
        
        set({ items: updated, total });

        if (isAuth) {
          try {
            await updateCartItemAPI(id, quantity);
          } catch (error) {
            console.error("Error updating quantity:", error);
          }
        }
      },

      removeItem: async (id) => {
        const isAuth = useUserStore.getState().isAuthenticated;

        const updated = get().items.filter((i) => i.id !== id);
        const total = updated.reduce((acc, i) => acc + i.price * i.quantity, 0);

        set({ items: updated, total });

        if (isAuth) {
          try {
            await removeFromCartAPI(id);
          } catch (error) {
            console.error("Error syncing remove item:", error);
          }
        }
      },

      setItems: (items: CartItem[]) => {
        const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items, total });
      },

      setTotal: (total: number) => set({ total }),

      clearCart: async () => {
        const isAuth = useUserStore.getState().isAuthenticated;

        set({ items: [], total: 0 });

        if (isAuth) {
          try {
            await clearCartAPI();
          } catch (error) {
            console.error("Error syncing clear cart:", error);
          }
        }
      },
    }),
    { name: "cart-store" }
  )
);