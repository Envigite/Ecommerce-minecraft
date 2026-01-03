import { z } from "zod";

const noHtmlRegex = /^[^<>]*$/;
const noHtmlMessage = { message: "No se permiten los caracteres < o >" };

export const contactSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede superar los 100 caracteres" })
    .regex(noHtmlRegex, noHtmlMessage),

  email: z
    .email({ message: "Debe ser un correo válido" })
    .trim()
    .toLowerCase()
    .max(255, { message: "El correo es demasiado largo" }),

  subject: z
    .string({ error: "El asunto es obligatorio" })
    .trim()
    .min(3, { message: "El asunto es muy corto" })
    .max(100, { message: "El asunto no puede superar los 100 caracteres" })
    .regex(noHtmlRegex, noHtmlMessage),
  message: z
    .string({ error: "El mensaje es obligatorio" })
    .trim()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres" })
    .max(2000, { message: "El mensaje no puede superar los 2000 caracteres" }) 
    .regex(noHtmlRegex, noHtmlMessage),

  userId: z
    .uuid()
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => (val === "" ? null : val)),
});