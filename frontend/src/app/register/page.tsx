"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.details?.[0]?.message ||
          data?.error ||
          data?.message ||
          "Error al registrarse";

        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setSuccessMsg("Cuenta creada correctamente");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-4">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Nombre de usuario</label>
          <input
            name="username"
            type="text"
            value={username}
            onKeyDown={blockSpaces}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={email}
            onKeyDown={blockSpaces}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onKeyDown={blockSpaces}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onKeyDown={blockSpaces}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-green-600">{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 cursor-pointer"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
        <div className="flex justify-center gap-2">
          <p>¿Ya tienes una cuenta?</p>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Inicia Sesión
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer text-gray-500 hover:text-gray-600"
          >
            Volver a inicio
          </button>
        </div>
      </form>
    </section>
  );
}
