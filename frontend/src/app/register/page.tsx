"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { register } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useUserStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const blockSpaces = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas deben coincidir");
      setLoading(false);
      return;
    }

    try {
      await register({ username, email, password, confirmPassword });

      setSuccessMsg("Cuenta creada correctamente. Redirigiendo...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error de conexión con el servidor");
    } finally {
      if (!successMsg) setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 text-center">
        Crear cuenta
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-8 rounded-lg border border-slate-200 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de usuario
          </label>
          <input
            name="username"
            type="text"
            value={username}
            onKeyDown={blockSpaces}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
            required
            placeholder="Ingresa tu nombre de usuario"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={email}
            onKeyDown={blockSpaces}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
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
            onKeyDown={blockSpaces}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
            required
            placeholder="********"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onKeyDown={blockSpaces}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
            required
            placeholder="********"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded border border-green-100">
            {successMsg}
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
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 text-center text-sm">
          <p className="text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sky-600 font-medium hover:underline cursor-pointer"
            >
              Inicia Sesión
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
