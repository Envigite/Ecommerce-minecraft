"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (res.status === 401) {
          setServerError("Tu sesión expiró, inicia sesión nuevamente.");
          setTimeout(() => {
            logout();
            router.push("/login");
          }, 1500);
          return;
        }

        if (!res.ok) {
          setServerError("Error al obtener perfil.");
          return;
        }
      } catch (error) {
        console.error(error);
        setServerError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, router, logout, hasHydrated]);

  if (!hasHydrated) return <p>Cargando...</p>;
  if (loading) return <p>Cargando perfil...</p>;
  if (serverError) return <p className="text-red-600">{serverError}</p>;
  if (!isAuthenticated) return null;

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tu perfil</h1>

      <div className="space-y-3 bg-white p-4 rounded border shadow">
        <p>
          <strong>Usuario:</strong> {user?.username}
        </p>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Rol:</strong> {user?.role}
        </p>
      </div>
      <button
        onClick={() => router.push("./profile/edit")}
        className="mt-6 w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 cursor-pointer transition"
      >
        Editar Perfil
      </button>
    </section>
  );
}
