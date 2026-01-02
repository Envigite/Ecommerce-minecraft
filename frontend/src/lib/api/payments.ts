const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const createCheckoutSessionAPI = async (items: any[], addressId: string | null, deliveryType: string) => {
  const res = await fetch(`${BASE_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ items, addressId, deliveryType }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al iniciar pago con Mercado Pago");
  }

  return res.json();
};