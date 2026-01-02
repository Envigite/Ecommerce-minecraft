"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { mergeCart } from "@/lib/api/cart";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { checkAuth } = useUserStore();

  useEffect(() => {
    const handleLogin = async () => {
      if (!token) {
        router.replace("/login?error=GoogleAuthFailed");
        return;
      }

      try {
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

        await checkAuth();

        try {
          const localItems = useCartStore.getState().items;
          if (localItems.length > 0) {
            const mergedData = await mergeCart(localItems);
            useCartStore.getState().setItems(mergedData.items ?? []);
          }
        } catch (err) {
          console.error("Error fusionando carrito:", err);
        }

        router.push("/");
      } catch (error) {
        console.error("Error en google success:", error);
        router.replace("/login?error=ProcessingFailed");
      }
    };

    handleLogin();
  }, [token, router, checkAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
      <h2 className="text-slate-600 font-medium animate-pulse">
        Finalizando autenticación con Google...
      </h2>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
