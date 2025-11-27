const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchProducts() {
    try {
    const res = await fetch(`${BASE}/api/products`,
        { credentials: "include" });
        if (!res.ok) throw new Error("Error al obtener productos");
    return await res.json();
    } catch (err) {
    console.error("API Error /fetchProducts" ,err);
    throw err;
    }
}

export async function deleteProduct(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al eliminar producto");
    }

    return true;
  } catch (err) {
    console.error("API Error /deleteProduct:", err);
    throw err;
  }
}

export const fetchProductById = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
    {
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Error obteniendo producto");
  return res.json();
};

export const updateProduct = async (id: string, payload: any) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
  const msg =
      data?.details?.[0]?.message ||
      data?.error ||
      data?.message ||
      "Error al actualizar producto";

    throw new Error(msg);
  }

return data;
};

export const createProduct = async (payload: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.details?.[0]?.message ||
      data?.error ||
      data?.message ||
      "Error al crear producto";
    throw new Error(msg);
  }

  return data;
};
