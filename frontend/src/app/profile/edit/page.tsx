"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser, hasHydrated } = useUserStore();

  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && user) {
      setUsername(user.username);
    }
  }, [user, hasHydrated]);

  if (!hasHydrated) return <p>Cargando...</p>;
  if (!user) return <p>No estás autenticado</p>;

  const blockSpaces = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editingUsername && !editingPassword) {
      setError("No hay cambios para guardar");
      return;
    }

    setLoading(true);

    try {
      if (editingUsername) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/username`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username.trim() }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(
            data?.details?.[0]?.message ||
              data?.error ||
              data?.message ||
              "Error al actualizar username"
          );
          setLoading(false);
          return;
        }

        setUser({
          id: user.id,
          username: data.username,
          email: user.email,
          role: user.role,
        });
      }

      if (editingPassword) {
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/password`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: password.trim() }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(
            data?.details?.[0]?.message ||
              data?.error ||
              data?.message ||
              "Error al actualizar contraseña"
          );
          setLoading(false);
          return;
        }
      }

      setSuccess("Perfil actualizado correctamente");

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Editar Perfil</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">
            {editingUsername ? "Nuevo nombre de usuario" : "Nombre de usuario"}
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onKeyDown={blockSpaces}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!editingUsername}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                !editingUsername ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setEditingUsername((prev) => !prev)}
              className="px-3 py-2 border rounded cursor-pointer hover:bg-slate-100"
            >
              {editingUsername ? "Cancelar" : "Editar"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            {editingPassword ? "Nueva contraseña" : "Contraseña"}
          </label>

          <div className="flex items-center gap-2">
            <input
              type="password"
              onKeyDown={blockSpaces}
              value={editingPassword ? password : "********"}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={!editingPassword}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                !editingPassword ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => {
                setEditingPassword((prev) => !prev);
                setPassword("");
                setConfirmPassword("");
              }}
              className="px-3 py-2 border rounded cursor-pointer hover:bg-slate-100"
            >
              {editingPassword ? "Cancelar" : "Editar"}
            </button>
          </div>

          {editingPassword && (
            <div className="mt-2">
              <label className="block text-sm font-medium">
                Confirmar contraseña
              </label>
              <input
                type="password"
                onKeyDown={blockSpaces}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 transition cursor-pointer"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
