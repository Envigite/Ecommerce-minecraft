"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { createOrderAPI } from "@/lib/api/orders";
import { createCheckoutSessionAPI } from "@/lib/api/payments";
import { useUserStore as useUserStoreCheck } from "@/store/useUserStore";

const SHIPPING_COST_VALUE = 3990;

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useUserStoreCheck();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const isFinishing = useRef(false);
  const dataFetchedRef = useRef(false);

  const [deliveryType, setDeliveryType] = useState<"shipping" | "pickup">(
    "shipping"
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [mpRedirectUrl, setMpRedirectUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const DEMO_USER = "TESTUSER3001675496263557888";
  const DEMO_PASS = "o0vHRTmId9";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const initData = async () => {
      if (dataFetchedRef.current) {
        setLoading(false);
        return;
      }
      dataFetchedRef.current = true;
      if (!user || !user.addresses || user.addresses.length === 0) {
        try {
          await checkAuth();
        } catch (error) {
          console.warn("Error refreshing checkout data:", error);
        }
      }
      setLoading(false);
    };
    initData();
  }, [checkAuth]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0 && !isFinishing.current) {
      router.push("/cart");
      return;
    }
    if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [loading, items, isAuthenticated, user, router, selectedAddressId]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingCost = deliveryType === "pickup" ? 0 : SHIPPING_COST_VALUE;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (deliveryType === "shipping" && !selectedAddressId) {
      alert("Por favor selecciona una dirección de envío");
      return;
    }
    if (!selectedPaymentId) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setProcessingPayment(true);

    try {
      if (selectedPaymentId === "mercadopago") {
        if (!selectedAddressId) {
          alert(
            "Para pagar con Mercado Pago necesitamos una dirección de envío."
          );
          setProcessingPayment(false);
          return;
        }

        const res = await createCheckoutSessionAPI(
          items,
          selectedAddressId,
          deliveryType
        );

        setMpRedirectUrl(res.url);
        setProcessingPayment(false);
        setShowDemoModal(true);
        return;
      }

      const orderPayload = {
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        deliveryType: deliveryType,
        addressId: deliveryType === "shipping" ? selectedAddressId! : undefined,
        paymentMethodId: selectedPaymentId!,
      };

      const newOrder = await createOrderAPI(orderPayload);

      isFinishing.current = true;
      clearCart();
      router.push(`/checkout/success?order_id=${newOrder.id}`);
    } catch (error: any) {
      console.error("Error al procesar compra:", error);

      if (
        error.message.includes("Stock") ||
        error.message.includes("insuficiente") ||
        error.message.includes("disponibles") ||
        error.message.includes("Stock insuficiente")
      ) {
        alert("⚠️ " + error.message);
        router.push("/cart");
        return;
      }

      alert(error.message || "Hubo un error al procesar tu pedido.");
      setProcessingPayment(false);
    }
  };

  const confirmRedirect = () => {
    if (mpRedirectUrl) {
      isFinishing.current = true;
      window.location.href = mpRedirectUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-800 animate-pulse">
          Cargando...
        </h2>
      </div>
    );
  }

  const hasAddresses = user?.addresses && user.addresses.length > 0;
  const hasCards = user?.cards && user.cards.length > 0;

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <h3 className="text-xl font-bold text-slate-900">
                Datos para el pago
              </h3>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Estás en modo Pruebas. Cuando se abra Mercado Pago, selecciona
              <span className="font-bold text-slate-800">
                {" "}
                "Ingresar con mi cuenta"{" "}
              </span>
              ten presente que esta pestaña se cerrará, copia y usa estos datos
              para ver las tarjetas de prueba:
            </p>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Usuario / E-mail
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono truncate">
                    {DEMO_USER}
                  </code>
                  <button
                    onClick={() => copyToClipboard(DEMO_USER, "user")}
                    className="cursor-pointer shrink-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    {copiedField === "user" ? (
                      <span className="text-green-600 font-bold">
                        ¡Copiado!
                      </span>
                    ) : (
                      <>Copiar</>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Contraseña
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono">
                    {DEMO_PASS}
                  </code>
                  <button
                    onClick={() => copyToClipboard(DEMO_PASS, "pass")}
                    className="cursor-pointer shrink-0 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {copiedField === "pass" ? (
                      <span className="text-green-600 font-bold">
                        ¡Copiado!
                      </span>
                    ) : (
                      "Copiar"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoModal(false)}
                className="cursor-pointer flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRedirect}
                className="cursor-pointer flex-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-lg hover:shadow-sky-500/20 transition flex justify-center items-center gap-2"
              >
                Ir a Mercado Pago
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/cart"
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                ¿Cómo quieres recibirlo?
              </h2>
              <div className="space-y-4">
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-slate-50 ${
                    deliveryType === "shipping"
                      ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    className="peer sr-only"
                    checked={deliveryType === "shipping"}
                    onChange={() => setDeliveryType("shipping")}
                  />
                  <div className="flex w-full gap-4 items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        deliveryType === "shipping"
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 18.75a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0-1.125-1.125a4.125 4.125 0 0 0-5.625 0V8.625a3.375 3.375 0 0 1 3.375-3.375h10.5a3.375 3.375 0 0 1 3.375 3.375v9.375m0 0a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0h-2.25m-5.25 0h-5.25m10.5 0v-3.75a3 3 0 0 0-3-3h-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Envío a domicilio
                      </h3>
                      <p className="text-sm text-slate-500">
                        Recibe en tu dirección guardada
                      </p>
                    </div>
                  </div>
                </label>

                {deliveryType === "shipping" && (
                  <div className="pl-4 ml-5 border-l-2 border-slate-100 space-y-4">
                    {hasAddresses && (
                      <div className="space-y-3 mb-4">
                        {user?.addresses?.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50 ${
                              selectedAddressId === addr.id
                                ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
                                : "border-slate-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="addressSelection"
                              className="mt-1 accent-sky-600"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {addr.alias}
                              </span>
                              <span className="text-sm text-slate-600">
                                {addr.street} {addr.number}
                              </span>
                              <span className="text-xs text-slate-400 block uppercase mt-0.5">
                                {addr.city}, {addr.region}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    <Link
                      href="/profile/edit?tab=addresses"
                      className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center transition">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
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
                      <span className="font-bold text-sm">
                        {hasAddresses
                          ? "Agregar otra dirección"
                          : "Agregar Dirección de Envío"}
                      </span>
                    </Link>
                  </div>
                )}

                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-slate-50 ${
                    deliveryType === "pickup"
                      ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    className="peer sr-only"
                    checked={deliveryType === "pickup"}
                    onChange={() => setDeliveryType("pickup")}
                  />
                  <div className="flex w-full gap-4 items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        deliveryType === "pickup"
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h4.018a1.5 1.5 0 0 0 1.5-1.5V9.375c0-.621-.504-1.125-1.125-1.125H3.562c-.621 0-1.125.504-1.125 1.125V19.5a1.5 1.5 0 0 0 1.5 1.5h6m9.975-10.5H12m0 0h2.25m-2.25 0a3 3 0 0 0-3 3v2.25m6-5.25h3m-6 0v2.25m.75-9.75h9.375c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125H4.125c-.621 0-1.125-.504-1.125-1.125v-5.25c0-.621.504-1.125 1.125-1.125H12.75Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Retiro en tienda
                      </h3>
                      <p className="text-sm text-slate-500">
                        Gratis - Av. Libertador 4000
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                ¿Cómo quieres pagar?
              </h2>
              <div className="space-y-3">
                <label
                  className={`relative flex items-center cursor-pointer rounded-xl border p-4 transition-all hover:bg-slate-50 ${
                    selectedPaymentId === "mercadopago"
                      ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="peer sr-only"
                    checked={selectedPaymentId === "mercadopago"}
                    onChange={() => setSelectedPaymentId("mercadopago")}
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs">
                      MP
                    </div>
                    <div>
                      <span className="text-slate-900 font-bold block">
                        Mercado Pago
                      </span>
                      <span className="text-xs text-slate-500">
                        Tarjetas, WebPay
                      </span>
                    </div>
                  </div>
                </label>
                {user?.cards?.map((card) => (
                  <label
                    key={card.id}
                    className={`relative flex items-center cursor-pointer rounded-xl border p-4 transition-all hover:bg-slate-50 ${
                      selectedPaymentId === card.id
                        ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="peer sr-only"
                      checked={selectedPaymentId === card.id}
                      onChange={() => setSelectedPaymentId(card.id)}
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold uppercase text-slate-500">
                        {card.brand}
                      </div>
                      <div>
                        <span className="text-slate-900 font-bold block">
                          •••• {card.last4}
                        </span>
                        <span className="text-xs text-slate-500">
                          {card.name}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}

                <Link
                  href="/profile/edit?tab=cards"
                  className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
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
                  <span className="font-bold text-sm">
                    {hasCards
                      ? "Agregar otra tarjeta"
                      : "Agregar Tarjeta de Crédito/Débito"}
                  </span>
                </Link>

                {deliveryType === "pickup" && (
                  <label
                    className={`relative flex items-center cursor-pointer rounded-xl border p-4 transition-all hover:bg-slate-50 ${
                      selectedPaymentId === "cash"
                        ? "border-sky-600 bg-sky-50/30 ring-1 ring-sky-600"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="peer sr-only"
                      checked={selectedPaymentId === "cash"}
                      onChange={() => setSelectedPaymentId("cash")}
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-slate-700 font-medium block">
                          Efectivo al retirar
                        </span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Productos</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0
                      ? "Gratis"
                      : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-bold text-slate-900 text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={
                  processingPayment ||
                  (deliveryType === "shipping" && !selectedAddressId) ||
                  !selectedPaymentId
                }
                className="cursor-pointer w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {processingPayment
                  ? "Procesando..."
                  : selectedPaymentId === "mercadopago"
                  ? "Pagar con Mercado Pago"
                  : "Confirmar Compra"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
