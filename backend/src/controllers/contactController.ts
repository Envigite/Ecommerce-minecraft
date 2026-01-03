import { Request, Response } from "express";
import { contactSchema } from "../schemas/contactSchema";
import { ContactModel } from "../models/contactModel";
import { EmailService } from "../services/emailService";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
    }

    const newMessage = await ContactModel.create({
        ...parsed.data,
        userId: parsed.data.userId || null
    });

    EmailService.sendContactAutoReply(parsed.data.email, parsed.data.name);

    res.status(201).json({ message: "Mensaje enviado correctamente", data: newMessage });

  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const messages = await ContactModel.getAll();
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener mensajes" });
    }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'replied'].includes(status)) {
            return res.status(400).json({ error: "Estado inválido" });
        }

        const updated = await ContactModel.updateStatus(id, status);
        if (!updated) return res.status(404).json({ error: "Mensaje no encontrado" });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar mensaje" });
    }
};