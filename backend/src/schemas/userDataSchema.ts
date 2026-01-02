import { z } from "zod";

const noHtmlRegex = /^[^<>]*$/;
const noHtmlMessage = { message: "No se permiten los caracteres < o >" };

export const addressSchema = z.object({
  alias: z
    .string({ error: "El alias es obligatorio" })
    .trim()
    .min(2, { message: "El alias debe tener al menos 2 caracteres" })
    .max(50, { message: "El alias es muy largo" })
    .regex(noHtmlRegex, noHtmlMessage),

  street: z
    .string({ error: "La calle es obligatoria" })
    .trim()
    .min(3, { message: "La calle debe tener al menos 3 caracteres" })
    .max(100, { message: "La calle es muy larga" })
    .regex(noHtmlRegex, noHtmlMessage),

  number: z
    .string({ error: "El número es obligatorio" })
    .trim()
    .min(1, { message: "El número es obligatorio" })
    .max(10, { message: "El número es muy largo" })
    .regex(noHtmlRegex, noHtmlMessage),

  city: z
    .string({ error: "La ciudad es obligatoria" })
    .trim()
    .min(2, { message: "La ciudad debe tener al menos 2 caracteres" })
    .regex(noHtmlRegex, noHtmlMessage),

  region: z
    .string({ error: "La región es obligatoria" })
    .trim()
    .min(2, { message: "La región debe tener al menos 2 caracteres" })
    .regex(noHtmlRegex, noHtmlMessage),

  isDefault: z.boolean().optional(),
});

export const cardSchema = z.object({
  name: z
    .string({ error: "El nombre del titular es obligatorio" })
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
      message: "El nombre solo puede contener letras",
    }),

  brand: z.enum(["visa", "mastercard", "amex"], {
    error: "La marca de la tarjeta no es válida",
  }),

  last4: z
    .string({ error: "Los últimos 4 dígitos son obligatorios" })
    .length(4, { message: "Deben ser exactamente los últimos 4 dígitos" })
    .refine((val) => /^\d+$/.test(val), { message: "Solo pueden ser números" }),
});