import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET no definido en .env");

interface JWTPayload {
  id: string;
  role: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "No hay sesión activa" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    req.user = {
        id: decoded.id,
        role: decoded.role
    };
    next();
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError ? "Token expirado" : "Token inválido";
    res.status(401).json({ error: message });
    return;
}
};
