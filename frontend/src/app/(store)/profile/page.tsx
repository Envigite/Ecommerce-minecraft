"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { fetchProfile } from "@/lib/api/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated, setUser } =
    useUserStore();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
      } catch (error: any) {
        console.error(error);

        if (error.message === "UNAUTHORIZED") {
          setServerError("Tu sesión expiró, inicia sesión nuevamente.");
          setTimeout(() => {
            logout();
            router.push("/login");
          }, 1500);
          return;
        }

        setServerError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, router, logout, hasHydrated, setUser]);

  if (!hasHydrated) return null;
  if (loading)
    return <p className="p-8 text-center text-slate-500">Cargando perfil...</p>;
  if (serverError)
    return (
      <p className="p-8 text-center text-red-600 font-medium">{serverError}</p>
    );
  if (!isAuthenticated) return null;

  return (
    <section className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Tu perfil</h1>

      <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
          <span className="block text-sm text-slate-500 mb-1">Usuario</span>
          <p className="font-medium text-slate-900 text-lg">{user?.username}</p>
        </div>

        <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
          <span className="block text-sm text-slate-500 mb-1">Email</span>
          <p className="font-medium text-slate-900 text-lg">{user?.email}</p>
        </div>
      </div>

      <button
        onClick={() => router.push("./profile/edit")}
        className="mt-6 w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 cursor-pointer transition font-medium shadow-sm hover:shadow"
      >
        Editar Perfil
      </button>
    </section>
  );
}
