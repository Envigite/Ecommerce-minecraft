import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Address, SavedCard } from "@/types/user";
import { addAddressAPI, removeAddressAPI, addCardAPI, removeCardAPI } from "@/lib/api/users";
import { fetchProfile, logoutAPI } from "@/lib/api/auth"; 

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  setHasHydrated: (v: boolean) => void;

  checkAuth: () => Promise<void>;

  addAddress: (address: Address) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  addCard: (card: SavedCard) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          await logoutAPI();
        } catch (error) {
          console.error("Error avisando al servidor del logout:", error);
        } finally {
          set({ user: null, isAuthenticated: false });
          
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          
          window.location.href = "/login"; 
        }
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),

      checkAuth: async () => {
        try {
          const profileData = await fetchProfile(); 
          
          if (profileData) {
            set({ user: profileData, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error: any) {
          if (error.message === "UNAUTHORIZED" || error.status === 401) {
            set({ user: null, isAuthenticated: false });
            return; 
          }
          console.error("Error verificando sesión:", error);
          set({ user: null, isAuthenticated: false });
        }
      },

      addAddress: async (address) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const previousUser = JSON.parse(JSON.stringify(currentUser));
        const tempId = address.id || crypto.randomUUID();

        const updatedAddresses = [...(currentUser.addresses || []), { ...address, id: tempId }];
        set({ user: { ...currentUser, addresses: updatedAddresses } });

        try {
          const savedAddress = await addAddressAPI(address);
          set((state) => {
            const user = state.user;
            if (!user || !user.addresses) return {};

            return {
              user: {
                ...user,
                addresses: user.addresses.map((a) => 
                  a.id === tempId ? savedAddress : a
                ),
              },
            };
          });
          
        } catch (error) {
          console.error("Fallo al guardar dirección en DB:", error);
          set({ user: previousUser });
          throw error;
        }
      },

      removeAddress: async (id) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const previousUser = JSON.parse(JSON.stringify(currentUser));

        const updatedAddresses = (currentUser.addresses || []).filter((a) => a.id !== id);
        set({ user: { ...currentUser, addresses: updatedAddresses } });

        try {
          await removeAddressAPI(id);
        } catch (error) {
          console.error("Fallo al borrar dirección en DB:", error);
          set({ user: previousUser });
          throw error;
        }
      },

      addCard: async (card) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const previousUser = JSON.parse(JSON.stringify(currentUser));
        const tempId = card.id || crypto.randomUUID();

        const updatedCards = [...(currentUser.cards || []), { ...card, id: tempId }];
        set({ user: { ...currentUser, cards: updatedCards } });

        try {
          const savedCard = await addCardAPI(card);

          set((state) => {
            const user = state.user;
            if (!user || !user.cards) return {};

            return {
              user: {
                ...user,
                cards: user.cards.map((c) => 
                  c.id === tempId ? savedCard : c
                ),
              },
            };
          });
        } catch (error) {
          console.error("Fallo al guardar tarjeta en DB:", error);
          set({ user: previousUser });
          throw error;
        }
      },

      removeCard: async (id) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const previousUser = JSON.parse(JSON.stringify(currentUser));

        const updatedCards = (currentUser.cards || []).filter((c) => c.id !== id);
        set({ user: { ...currentUser, cards: updatedCards } });

        try {
          await removeCardAPI(id);
        } catch (error) {
          console.error("Fallo al borrar tarjeta en DB:", error);
          set({ user: previousUser });
          throw error;
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ 
        user: state.user 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);