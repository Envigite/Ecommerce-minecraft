const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreateOrderPayload {
  items: { id: string; quantity: number; price: number }[];
  total: number;
  deliveryType: "shipping" | "pickup";
  addressId?: string;
  paymentMethodId?: string;
}

export const createOrderAPI = async (orderData: CreateOrderPayload) => {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al procesar la orden");
  }
  return res.json();
};

export const getMyOrdersAPI = async () => {
  const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener historial de compras");
  return res.json();
};

export const getOrderByIdAPI = async (orderId: string) => {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
     if(res.status === 404) return null;
     throw new Error("Error al obtener detalle de la orden");
  }
  return res.json();
};

export const getAllOrdersAdminAPI = async (page = 1, status = 'all', search = '') => {
  
  const res = await fetch(`${BASE_URL}/api/orders/admin/all?page=${page}&limit=10&status=${status}&search=${search}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al cargar órdenes");
  return res.json();
};

export const updateOrderStatusAPI = async (id: string, status: string) => {
  const res = await fetch(`${BASE_URL}/api/orders/admin/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
};

export const deleteOrderAPI = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/orders/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al eliminar orden");
  return res.json();
};

export const getOrderStatsAPI = async () => {
  const res = await fetch(`${BASE_URL}/api/orders/admin/stats`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error cargando estadísticas");
  return res.json();
};

export const getAdminOrderByIdAPI = async (orderId: string) => {
  const res = await fetch(`${BASE_URL}/api/orders/admin/${orderId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
     if(res.status === 404) return null;
     throw new Error("Error al obtener detalle de la orden admin");
  }
  return res.json();
};