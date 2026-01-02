"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { updateUsername, updatePassword } from "@/lib/api/auth";

type TabType = "account" | "addresses" | "cards";

export default function EditProfilePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const initialTab: TabType =
    tabParam === "addresses" || tabParam === "cards" ? tabParam : "account";

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (feedback?.type === "success") {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const router = useRouter();
  const {
    user,
    setUser,
    hasHydrated,
    addAddress,
    removeAddress,
    addCard,
    removeCard,
  } = useUserStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingAccount, setLoadingAccount] = useState(false);

  const isGoogleUser = !!user?.google_id;

  const [addrForm, setAddrForm] = useState({
    alias: "",
    street: "",
    number: "",
    city: "",
    region: "",
  });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addrFeedback, setAddrFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    brand: "visa" as "visa" | "mastercard" | "amex",
  });
  const [showCardForm, setShowCardForm] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (cardFeedback?.type === "success") {
      const timer = setTimeout(() => setCardFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [cardFeedback]);

  useEffect(() => {
    if (addrFeedback?.type === "success") {
      const timer = setTimeout(() => setAddrFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [addrFeedback]);

  useEffect(() => {
    if (hasHydrated && user) {
      setUsername(user.username);
    }
  }, [user, hasHydrated]);

  useEffect(() => {
    if (!password) setConfirmPassword("");
  }, [password]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardForm({ ...cardForm, number: formatted });
  };

  if (!hasHydrated) return null;
  if (!user) return <p className="p-8 text-center">No autenticado</p>;

  const hasChanges = username !== user?.username || password.length > 0;

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    setFeedback(null);

    if (username) {
      if (/\s/.test(username)) {
        setFeedback({
          type: "error",
          message: "El nombre de usuario no puede contener espacios.",
        });
        return;
      }
      if (username.length < 3) {
        setFeedback({
          type: "error",
          message: "El nombre de usuario debe tener al menos 3 caracteres.",
        });
        return;
      }
    }

    if (password) {
      if (/\s/.test(password)) {
        setFeedback({
          type: "error",
          message: "La contraseña no puede contener espacios.",
        });
        return;
      }
      if (password.length < 6) {
        setFeedback({
          type: "error",
          message: "La contraseña debe tener al menos 6 caracteres.",
        });
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setFeedback({
          type: "error",
          message: "La contraseña debe incluir al menos una mayúscula.",
        });
        return;
      }
      if (!/[a-z]/.test(password)) {
        setFeedback({
          type: "error",
          message: "La contraseña debe incluir al menos una minúscula.",
        });
        return;
      }
      if (!/\d/.test(password)) {
        setFeedback({
          type: "error",
          message: "La contraseña debe incluir al menos un número.",
        });
        return;
      }
      if (password !== confirmPassword) {
        setFeedback({
          type: "error",
          message: "Las contraseñas no coinciden.",
        });
        return;
      }
    }

    setLoadingAccount(true);

    try {
      if (username !== user?.username) {
        const data = await updateUsername(username.trim());
        if (user) setUser({ ...user, username: data.username });
      }

      if (password) {
        await updatePassword(password.trim());
      }

      setFeedback({
        type: "success",
        message: "Perfil actualizado correctamente.",
      });
      setPassword("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar.",
      });
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrFeedback(null);
    setLoadingAddress(true);

    const tempId = `temp-${Date.now()}`;

    const addressToSave = { ...addrForm, id: tempId, isDefault: false };

    try {
      await addAddress(addressToSave as any);

      setAddrFeedback({
        type: "success",
        message: "Dirección agregada correctamente.",
      });
      setAddrForm({ alias: "", street: "", number: "", city: "", region: "" });
      setShowAddrForm(false);
    } catch (err: any) {
      console.warn("Error capturado en UI:", err);
      setAddrFeedback({
        type: "error",
        message: err.message || "Error al guardar la dirección.",
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardFeedback(null);
    setLoadingCard(true);

    const rawNumber = cardForm.number.replace(/\s/g, "");

    if (rawNumber.length < 13) {
      setCardFeedback({
        type: "error",
        message: "El número de tarjeta es muy corto.",
      });
      setLoadingCard(false);
      return;
    }

    const last4 = rawNumber.slice(-4);
    const tempId = `temp-card-${Date.now()}`;

    const cardToSend = {
      id: tempId,
      name: cardForm.name,
      brand: cardForm.brand,
      last4: last4,
    };

    try {
      await addCard(cardToSend as any);
      setCardFeedback({
        type: "success",
        message: "Tarjeta guardada correctamente.",
      });
      setCardForm({ name: "", number: "", brand: "visa" });
      setShowCardForm(false);
    } catch (err: any) {
      console.warn("Error validación tarjeta:", err);
      setCardFeedback({
        type: "error",
        message: err.message || "Error al guardar la tarjeta.",
      });
    } finally {
      setLoadingCard(false);
    }
  };

  const TAB_LABELS: Record<TabType, string> = {
    account: "Mi Cuenta",
    addresses: "Mis Direcciones",
    cards: "Métodos de Pago",
  };

  return (
    <section className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <button
          onClick={() => router.back()}
          className="cursor-pointer text-sm text-slate-500 hover:text-sky-600 font-medium"
        >
          Volver al Perfil
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
        {(["account", "addresses", "cards"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* --- TAB 1: CUENTA --- */}
      {activeTab === "account" && (
        <form
          onSubmit={handleUpdateAccount}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-sky-600"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 8c-2.67 0-5.03 1.36-6.4 3.43A8 8 0 0 0 12 20a8 8 0 0 0 6.4-2.57C17.03 15.36 14.67 14 12 14Z"
                  clipRule="evenodd"
                />
              </svg>
              Información Pública
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-sky-600"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                  clipRule="evenodd"
                />
              </svg>
              Seguridad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {isGoogleUser
                    ? "Crear Contraseña (Opcional)"
                    : "Cambiar Contraseña"}
                </label>
                {isGoogleUser && (
                  <span className="text-xs text-blue-600 block mb-2">
                    Al crear una contraseña podrás entrar con tu email sin usar
                    Google.
                  </span>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!password}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all placeholder:text-slate-300 ${
                    password && confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                      : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  } ${
                    !password
                      ? "bg-slate-50 cursor-not-allowed text-slate-400"
                      : ""
                  }`}
                />
              </div>
            </div>
            {password && (
              <p className="text-xs text-slate-400 ml-1">
                Deja los campos vacíos si no deseas cambiar tu contraseña
                actual.
              </p>
            )}
          </div>

          <div className="pt-2">
            {feedback && (
              <div
                className={`mb-4 p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-bottom-2 border ${
                  feedback.type === "error"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-green-50 text-green-700 border-green-100"
                }`}
              >
                {feedback.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!hasChanges || loadingAccount}
              className="cursor-pointer w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loadingAccount ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: DIRECCIONES --- */}
      {activeTab === "addresses" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {addrFeedback && !showAddrForm && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                addrFeedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {addrFeedback.type === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {addrFeedback.message}
            </div>
          )}

          <div className="grid gap-4">
            {user.addresses?.map((addr) => (
              <div
                key={addr.id}
                className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-100 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 bg-sky-50 text-sky-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">
                          {addr.alias}
                        </h3>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide border border-green-200">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {addr.street} #{addr.number}, {addr.city}
                      </p>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                        {addr.region}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Eliminar dirección"
                  >
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
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {(!user.addresses || user.addresses.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">
                  No tienes direcciones guardadas.
                </p>
              </div>
            )}
          </div>

          {!showAddrForm ? (
            <button
              onClick={() => {
                setShowAddrForm(true);
                setAddrFeedback(null);
              }}
              className="cursor-pointer group w-full py-4 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl bg-white hover:bg-sky-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-slate-500 hover:text-sky-600 font-bold"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              Agregar nueva dirección
            </button>
          ) : (
            <form
              onSubmit={handleAddAddress}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl ring-1 ring-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">
                  Nueva Dirección
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddrForm(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {addrFeedback?.type === "error" && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {addrFeedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Alias
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Casa, Oficina"
                    value={addrForm.alias}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, alias: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Calle
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Av. Libertador..."
                    value={addrForm.street}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, street: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Número
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="1234"
                    value={addrForm.number}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, number: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Ciudad
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Santiago"
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, city: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Región
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Región Metropolitana"
                    value={addrForm.region}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, region: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddrForm(false)}
                  className="cursor-pointer px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAddress}
                  className="cursor-pointer bg-sky-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  {loadingAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Dirección"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* --- TAB 3: TARJETAS --- */}
      {activeTab === "cards" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {cardFeedback && !showCardForm && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                cardFeedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {cardFeedback.message}
            </div>
          )}

          <div className="grid gap-4">
            {user.cards?.map((card) => (
              <div
                key={card.id}
                className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-100 transition-all duration-200 flex justify-between items-center"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                    {card.brand === "visa" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="2500"
                        height="2500"
                        viewBox="0 0 141.732 141.732"
                        id="visa"
                      >
                        <g fill="#2566af">
                          <path d="M62.935 89.571h-9.733l6.083-37.384h9.734zM45.014 52.187L35.735 77.9l-1.098-5.537.001.002-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s4.691.976 10.181 4.273l8.456 32.479h10.141l15.485-37.385H45.014zM121.569 89.571h8.937l-7.792-37.385h-7.824c-3.613 0-4.493 2.786-4.493 2.786L95.881 89.571h10.146l2.029-5.553h12.373l1.14 5.553zm-10.71-13.224l5.114-13.99 2.877 13.99h-7.991zM96.642 61.177l1.389-8.028s-4.286-1.63-8.754-1.63c-4.83 0-16.3 2.111-16.3 12.376 0 9.658 13.462 9.778 13.462 14.851s-12.075 4.164-16.06.965l-1.447 8.394s4.346 2.111 10.986 2.111c6.642 0 16.662-3.439 16.662-12.799 0-9.72-13.583-10.625-13.583-14.851.001-4.227 9.48-3.684 13.645-1.389z"></path>
                        </g>
                        <path
                          fill="#e6a540"
                          d="M34.638 72.364l-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s7.373 1.528 14.445 7.253c6.762 5.472 8.967 12.292 8.967 12.292z"
                        ></path>
                        <path fill="none" d="M0 0h141.732v141.732H0z"></path>
                      </svg>
                    )}
                    {card.brand === "mastercard" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-10 h-10"
                        aria-label="Mastercard"
                      >
                        <path
                          fill="#FF5F00"
                          d="M15.245 17.831h-6.49V6.168h6.49v11.663z"
                        />

                        <path
                          fill="#EB001B"
                          transform="scale(0.92) translate(1.04 1.04)"
                          d="M9.167 12A7.404 7.404 0 0 1 12 6.169 7.417 7.417 0 0 0 0 12a7.417 7.417 0 0 0 11.999 5.831A7.406 7.406 0 0 1 9.167 12z"
                        />

                        <path
                          fill="#F79E1B"
                          transform="scale(0.92) translate(1.04 1.04)"
                          d="M24 12a7.417 7.417 0 0 1-12 5.831c1.725-1.358 2.833-3.465 2.833-5.831S13.725 7.527 12 6.169A7.417 7.417 0 0 1 24 12z"
                        />
                      </svg>
                    )}
                    {card.brand === "amex" && (
                      <svg
                        width="64"
                        height="40"
                        viewBox="0 0 64 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="64" height="40" rx="6" fill="#1F72CD" />

                        <text
                          x="32"
                          y="26"
                          textAnchor="middle"
                          fontSize="18"
                          fontWeight="700"
                          fontFamily="Arial, Helvetica, sans-serif"
                          fill="#FFFFFF"
                          letterSpacing="1"
                        >
                          AMEX
                        </text>
                      </svg>
                    )}
                  </div>

                  <div>
                    <h3 className="font-mono text-slate-900 text-lg tracking-widest">
                      •••• •••• •••• {card.last4}
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      {card.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeCard(card.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar tarjeta"
                >
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
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {(!user.cards || user.cards.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">
                  No tienes tarjetas guardadas.
                </p>
              </div>
            )}
          </div>

          {!showCardForm ? (
            <button
              onClick={() => {
                setShowCardForm(true);
                setCardFeedback(null);
              }}
              className="cursor-pointer group w-full py-4 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl bg-white hover:bg-sky-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-slate-500 hover:text-sky-600 font-bold"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              Agregar nueva tarjeta
            </button>
          ) : (
            <form
              onSubmit={handleAddCard}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl ring-1 ring-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">
                  Nueva Tarjeta
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCardForm(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {cardFeedback?.type === "error" && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {cardFeedback.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Número de Tarjeta
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </div>
                    <input
                      required
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardForm.number}
                      onChange={handleCardNumberChange}
                      className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-mono text-lg"
                    />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Nombre del Titular
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    value={cardForm.name}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Marca
                  </label>
                  <div className="relative">
                    <select
                      value={cardForm.brand}
                      onChange={(e) =>
                        setCardForm({
                          ...cardForm,
                          brand: e.target.value as any,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCardForm(false)}
                  className="cursor-pointer px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCard}
                  className="cursor-pointer bg-sky-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingCard ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Tarjeta"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
