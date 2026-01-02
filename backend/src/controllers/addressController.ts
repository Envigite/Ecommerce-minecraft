import { Request, Response } from "express";
import { AddressModel } from "../models/addressModel";
import { addressSchema } from "../schemas/userDataSchema";

export const addAddress = async (req: Request, res: Response) => {
  try {
    const parsed = addressSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0].message, 
        error: "Datos inválidos", 
      });
    }

    const data = parsed.data;
    const userId = (req as any).user.id;

    const newAddr = await AddressModel.create({
      ...data,
      user_id: userId,
    });

    res.status(201).json(newAddr);
  } catch (error) {
    console.error("Error addAddress:", error);
    res.status(500).json({ message: "Error al crear dirección" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const deleted = await AddressModel.delete(id, userId);

    if (!deleted) return res.status(404).json({ message: "Dirección no encontrada" });

    res.json({ message: "Dirección eliminada" });
  } catch (error) {
    console.error("Error deleteAddress:", error);
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
};

export const getMyAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const addresses = await AddressModel.findByUser(userId);
    res.json(addresses);
  } catch (error) {
    console.error("Error getMyAddresses:", error);
    res.status(500).json({ message: "Error obteniendo direcciones" });
  }
};