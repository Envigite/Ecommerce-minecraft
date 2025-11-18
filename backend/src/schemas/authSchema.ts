import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string({ error: "El nombre de usuario es obligatorio" })
    .trim()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(30, { message: "El nombre de usuario no puede superar los 30 caracteres" })
    .refine((val) => !/\s/.test(val), {
      message: "El nombre de usuario no puede contener espacios",
    })
    .refine((val) => !/[<>]/.test(val), {
    message: "El nombre no puede contener caracteres especiales",
  }),

  email: z
    .email({ message: "Debe ser un email válido" })
    .transform((val) => val.toLowerCase())
    .refine((val) => !/\s/.test(val), {
      message: "El correo no puede contener espacios",
    }),

  password: z
    .string({ error: "La contraseña es obligatoria" })
    .trim()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(50, { message: "La contraseña no puede superar los 50 caracteres" })
    .refine((val) => !/\s/.test(val), { message: "La contraseña no puede contener espacios" })
    .refine((val) => /[A-Z]/.test(val), { message: "Debe incluir una mayúscula" })
    .refine((val) => /[a-z]/.test(val), { message: "Debe incluir una minúscula" })
    .refine((val) => /\d/.test(val), { message: "Debe incluir un número" })
});

export const loginSchema = z.object({
  email: z
    .email({ message: "Debe ser un email válido" })
    .trim()
    .refine((val) => !/[<>]/.test(val), {
      message: "El email contiene caracteres no permitidos",
    })
    .transform((val) => val.toLowerCase())
    .refine((val) => !/\s/.test(val), {
      message: "El correo no puede contener espacios",
    }),

  password: z
    .string({ error: "La contraseña es obligatoria" })
    .trim()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .refine((val) => !/[<>]/.test(val), {
      message: "La contraseña contiene caracteres no permitidos",
    })
    .refine((val) => !/\s/.test(val), { message: "La contraseña no puede contener espacios" })
});

export const updateUsernameSchema = z.object({
  username: z
    .string({ error: "El nombre de usuario es obligatorio" })
    .trim()
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(30, { message: "No puede superar los 30 caracteres" })
    .refine((val) => !/\s/.test(val), {
      message: "El nombre de usuario no puede contener espacios",
    })
    .refine((val) => !/[<>]/.test(val), {
      message: "No puede contener caracteres especiales",
    }),
});

export const updatePasswordSchema = z.object({
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .trim()
    .min(6, { message: "Debe tener al menos 6 caracteres" })
    .max(50, { message: "No puede superar los 50 caracteres" })
    .refine((val) => !/\s/.test(val), "No puede contener espacios")
    .refine((val) => /[A-Z]/.test(val), "Debe incluir una mayúscula")
    .refine((val) => /[a-z]/.test(val), "Debe incluir una minúscula")
    .refine((val) => /\d/.test(val), "Debe incluir un número"),
});

