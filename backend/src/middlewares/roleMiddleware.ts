import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware";

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: "Acceso denegado" });
    next();
  };
};
