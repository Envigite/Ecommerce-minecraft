import { Request, Response } from "express";
import { CardModel } from "../models/cardModel";
import { cardSchema } from "../schemas/userDataSchema";

export const addCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const parsed = cardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ 
        message: parsed.error.issues[0].message, 
        error: "Datos inválidos"
      });
    }

    const newCard = await CardModel.create({ 
      ...parsed.data, 
      user_id: userId 
    });
    
    res.status(201).json(newCard);

  } catch (error) {
    console.error("Error addCard:", error);
    res.status(500).json({ message: "Error al guardar tarjeta" });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const deleted = await CardModel.delete(id, userId);

    if (!deleted) return res.status(404).json({ message: "Tarjeta no encontrada" });

    res.json({ message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("Error deleteCard:", error);
    res.status(500).json({ message: "Error al eliminar tarjeta" });
  }
};

export const getMyCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cards = await CardModel.findByUser(userId);
    res.json(cards);
  } catch (error) {
    console.error("Error getMyCards:", error);
    res.status(500).json({ message: "Error obteniendo tarjetas" });
  }
};