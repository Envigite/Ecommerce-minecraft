import type { User } from "@/types/user";

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