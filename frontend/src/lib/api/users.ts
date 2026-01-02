import type { User, Address, SavedCard } from "@/types/user";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE_URL}/api/users`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener usuarios");
  }

  return res.json();
};

export const updateUserRole = async (id: string, newRole: "admin" | "manager" | "user") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/role/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role: newRole }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error al actualizar rol");
  }

  return res.json();
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error al eliminar usuario");
  }

  return true;
};

export const addAddressAPI = async (address: Address) => {
  const res = await fetch(`${BASE_URL}/api/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(address),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error al guardar dirección en DB");
  }

  return data;
};

export const removeAddressAPI = async (addressId: string) => {
  const res = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
    method: "DELETE",
    credentials: "include",
  });
  
  if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Error al eliminar dirección de DB");
  }
};

export const addCardAPI = async (card: SavedCard) => {
  const res = await fetch(`${BASE_URL}/api/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(card),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("❌ Error del Backend al guardar tarjeta:", { status: res.status, body: data });
    throw new Error(data?.message || `Error ${res.status}: No se pudo guardar la tarjeta`);
  }
  return data;
};

export const removeCardAPI = async (cardId: string) => {
  const res = await fetch(`${BASE_URL}/api/cards/${cardId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Error al eliminar tarjeta de DB");
  }
};