"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { updateUsername, updatePassword } from "@/lib/api/auth";

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

  if (!hasHydrated) return null;
  if (!user) return <p className="p-8 text-center">No estás autenticado</p>;

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
        const data = await updateUsername(username.trim());

        setUser({
          ...user,
          username: data.username,
        });
      }

      if (editingPassword) {
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        await updatePassword(password.trim());
      }

      setSuccess("Perfil actualizado correctamente");

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Editar Perfil</h1>

      <form
        className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de usuario
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onKeyDown={blockSpaces}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!editingUsername}
              className={`flex-1 border rounded px-3 py-2 transition-colors ${
                !editingUsername
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : "bg-white border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none"
              }`}
            />
            <button
              type="button"
              onClick={() => setEditingUsername((prev) => !prev)}
              className="px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              {editingUsername ? "Cancelar" : "Editar"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              onKeyDown={blockSpaces}
              value={editingPassword ? password : "********"}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={!editingPassword}
              placeholder={editingPassword ? "Nueva contraseña" : ""}
              className={`flex-1 border rounded px-3 py-2 transition-colors ${
                !editingPassword
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-default"
                  : "bg-white border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none"
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setEditingPassword((prev) => !prev);
                setPassword("");
                setConfirmPassword("");
              }}
              className="px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              {editingPassword ? "Cancelar" : "Editar"}
            </button>
          </div>

          {editingPassword && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                onKeyDown={blockSpaces}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded border border-green-100">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!editingUsername && !editingPassword)}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition shadow-sm ${
            loading || (!editingUsername && !editingPassword)
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 hover:shadow-md cursor-pointer"
          }`}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
