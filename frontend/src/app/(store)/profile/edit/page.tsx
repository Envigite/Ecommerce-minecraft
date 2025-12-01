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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && user) {
      setUsername(user.username);
    }
  }, [user, hasHydrated]);

  if (!hasHydrated) return null;
  if (!user)
    return (
      <p className="p-8 text-center text-slate-500">No estás autenticado</p>
    );

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

    if (editingPassword) {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setLoading(true);

    try {
      if (editingUsername && username !== user.username) {
        const data = await updateUsername(username.trim());
        setUser({ ...user, username: data.username });
      }

      if (editingPassword) {
        await updatePassword(password.trim());
      }

      setSuccess("Perfil actualizado correctamente");

      setPassword("");
      setConfirmPassword("");
      setEditingPassword(false);
      setEditingUsername(false);

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({
    visible,
    toggle,
  }: {
    visible: boolean;
    toggle: () => void;
  }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none"
      tabIndex={-1}
    >
      {visible ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <section className="max-w-xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Configuración de Cuenta
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm cursor-pointer text-slate-500 hover:text-sky-600 font-medium"
        >
          Cancelar
        </button>
      </div>

      <form
        className="space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-700">
              Nombre de usuario
            </label>
            {!editingUsername && (
              <button
                type="button"
                onClick={() => setEditingUsername(true)}
                className="text-xs cursor-pointer text-sky-600 font-bold hover:underline uppercase tracking-wide"
              >
                Editar
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={username}
              onKeyDown={blockSpaces}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!editingUsername}
              disabled={!editingUsername}
              className={`w-full rounded-lg px-4 py-3 transition-all outline-none ${
                editingUsername
                  ? "bg-white border-2 border-sky-500 text-slate-900 shadow-sm"
                  : "bg-slate-50 border border-slate-200 text-slate-500 cursor-default"
              }`}
            />
            {editingUsername && (
              <button
                type="button"
                onClick={() => {
                  setEditingUsername(false);
                  setUsername(user.username);
                }}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            {!editingPassword && (
              <button
                type="button"
                onClick={() => {
                  setEditingPassword(true);
                  setPassword("");
                }}
                className="text-xs cursor-pointer text-sky-600 font-bold hover:underline uppercase tracking-wide"
              >
                Cambiar
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type={editingPassword && showPassword ? "text" : "password"}
              value={editingPassword ? password : "••••••••••••"}
              onKeyDown={blockSpaces}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={!editingPassword}
              disabled={!editingPassword}
              placeholder={editingPassword ? "Nueva contraseña" : ""}
              className={`w-full rounded-lg px-4 py-3 transition-all outline-none pr-10 ${
                editingPassword
                  ? "bg-white border-2 border-sky-500 text-slate-900 shadow-sm"
                  : "bg-slate-50 border border-slate-200 text-slate-500 cursor-default tracking-widest"
              }`}
            />

            {editingPassword ? (
              <EyeIcon
                visible={showPassword}
                toggle={() => setShowPassword(!showPassword)}
              />
            ) : null}
          </div>

          {editingPassword && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  onKeyDown={blockSpaces}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-sky-500 rounded-lg px-4 py-3 text-slate-900 shadow-sm outline-none pr-10 transition-colors"
                  placeholder="Repite la contraseña"
                />
                <EyeIcon
                  visible={showConfirmPassword}
                  toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPassword(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-xs cursor-pointer pt-2 text-red-500 hover:text-red-700 mt-2 font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || (!editingUsername && !editingPassword)}
            className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 ${
              loading || (!editingUsername && !editingPassword)
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-sky-600 hover:bg-sky-700 cursor-pointer shadow-sky-100"
            }`}
          >
            {loading ? "Guardando cambios..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
