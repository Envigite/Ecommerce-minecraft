export const fetchProfile = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error("Error al obtener perfil");
  }

  return res.json();
};

export const updateUsername = async (username: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/username`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.details?.[0]?.message || data?.message || "Error al actualizar usuario";
    throw new Error(msg);
  }

  return data;
};

export const updatePassword = async (password: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.details?.[0]?.message || data?.message || "Error al actualizar contraseña";
    throw new Error(msg);
  }

  return data;
};

export const login = async (credentials: { email: string; password: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al iniciar sesión");
  }

  return data;
};

export const register = async (payload: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.details?.[0]?.message ||
      data?.error ||
      data?.message ||
      "Error al registrarse";
    throw new Error(msg);
  }

  return data;
};

export const logoutAPI = async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error al cerrar sesión en el servidor", error);
  }
};