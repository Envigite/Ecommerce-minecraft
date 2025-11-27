"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { login } from "@/lib/api/auth";
import { mergeCart } from "@/lib/api/cart";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setUser } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated && user?.role) {
      if (user.role === "admin" || user.role === "manager") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated) return null;
  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      });

      if (data.role === "admin" || data.role === "manager") {
        useCartStore.getState().clearCart();
        return router.push("/admin/dashboard");
      }

      if (data.role === "user") {
        try {
          const localItems = useCartStore.getState().items;

          if (localItems.length > 0) {
            const mergedData = await mergeCart(localItems);
            useCartStore.getState().setItems(mergedData.items ?? []);
          }
        } catch (mergeError) {
          console.error("Error merging cart:", mergeError);
        }

        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error de conexión con el servidor");
    }
  };

  return (
    <section className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 text-center">
        Iniciar sesión
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-8 rounded-lg border border-slate-200 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Correo electrónico
          </label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
            autoComplete="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
            autoComplete="current-password"
            required
            placeholder="********"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition shadow-sm ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 cursor-pointer"
          }`}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 text-center text-sm">
          <p className="text-slate-600">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-sky-600 font-medium hover:underline cursor-pointer"
            >
              Regístrate
            </button>
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Volver a inicio
          </button>
        </div>
      </form>
    </section>
  );
}
