export const sendContactMessageAPI = async (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string | null;
}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.details?.[0]?.message ||
      data?.message ||
      "Error al enviar mensaje";

    const error: any = new Error(msg);
    
    error.details = data.details; 
    
    throw error;
  }

  return data;
};

export const getMessagesAPI = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || "Error al obtener los mensajes";
    throw new Error(msg);
  }

  return data;
};

export const updateMessageStatusAPI = async (id: string, status: "pending" | "replied") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || "Error al actualizar el estado";
    throw new Error(msg);
  }

  return data;
};