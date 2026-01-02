import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { logAction } from "../utils/auditLogger";
import type { AuthRequest } from "../middlewares/authMiddleware";

const VALID_ROLES = ["admin", "manager", "user"];

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) return res.status(400).json({ error: "ID requerido" });
    
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ 
        error: `Rol inválido. Roles permitidos: ${VALID_ROLES.join(", ")}` 
      });
    }

    const user = await UserModel.updateUserRoleModel(id, role);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await logAction(req.user?.id, "ACTIONS.ROLE_CHANGE", "user", id, { new_role: role });

    return res.status(200).json({ message: `Rol actualizado a ${role}`, user });
  } catch (err) {
    console.error("Error al cambiar rol:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const deleted = await UserModel.deleteUserModel(id);
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });

    await logAction(req.user?.id, "ACTIONS.DELETE_USER", "user", id);

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
