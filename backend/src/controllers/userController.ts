import type { Request, Response } from "express";
import { UserModel } from "../models/userModel";

export const promoteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const user = await UserModel.promoteUserModel(id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.status(200).json({ message: "Usuario promovido a admin", user });
  } catch (err) {
    console.error("Error al promover usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const demoteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const user = await UserModel.demoteUserModel(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.status(200).json({ message: "Usuario degradado a user", user });
  } catch (err) {
    console.error("Error al degradar usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const deleted = await UserModel.deleteUserModel(id);

    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.status(200).json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.listUsersModel();

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
