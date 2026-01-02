import type { Request, Response } from "express";
import { registerSchema, loginSchema, updateUsernameSchema, updatePasswordSchema } from "../schemas/authSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import { AddressModel } from "../models/addressModel";
import { CardModel } from "../models/cardModel";
import type { LoginBody, RegisterBody } from "../types/auth";

const JWT_SECRET: string = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "30d";
const isProduction = process.env.NODE_ENV === 'production';


// ---------------- REGISTER ----------------
export const registerUser = async (
  req: Request <{}, {}, RegisterBody>, 
  res: Response
) => {
  try {

    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.issues,
      });
    }

    const { username, email, password } = parsed.data;

    const existing = await UserModel.findByEmailOrUsername(email, username);

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ error: "El correo ya está registrado" })
      }
      if (existing.username === username) {
        return res.status(409).json({ error: "El nombre de usuario ya está en uso" })
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.createUser(
      username,
      email,
      passwordHash
    );

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 días
      path: "/",
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ---------------- LOGIN ----------------
export const loginUser = async (
  req: Request<{}, {}, LoginBody>, 
  res: Response) => {
  try {

    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.issues,
      });
    }

    const { email, password } = parsed.data;

    const user = await UserModel.findByEmail(email);

    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 días
      path: "/",
    });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ---------------- LOGOUT ----------------
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.cookie("token", "", {
     expires: new Date(0), 
     path: "/"
  });

  return res.status(200).json({ message: "Sesión cerrada" });
};

// ---------------- GET USER ID ----------------
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(404).json({ error: "Usuario no encontrado" });

    const user = await UserModel.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado en base de datos" });
    }

    const [addresses, cards] = await Promise.all([
        AddressModel.findByUser(userId),
        CardModel.findByUser(userId)
    ]);

    return res.json({
        ...user,
        addresses,
        cards
    });
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ---------------- UPDATE ----------------
export const updateUsernameController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const parsed = updateUsernameSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.issues,
      });
    }

    const updatedUser = await UserModel.updateUser(userId, parsed.data.username);
    if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(updatedUser);
  } catch (err) {
    const error = err as any;
    console.error(err);
    if (error.code === '23505') {
       return res.status(409).json({ error: "Este nombre de usuario ya está ocupado." });
    }
    
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

export const updatePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.issues,
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const updatedUser = await UserModel.updateUser(userId, undefined, hashedPassword);

    if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ message: "Contraseña actualizada correctamente" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al actualizar contraseña" });
  }
};

export const checkUserProfile = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Token válido", user: req.user })
}

export const googleCallback = (req: any, res: any) => {
  const user = req.user;

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secreto_super_seguro",
    { expiresIn: "7d" }
  );
  const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";

  res.redirect(`${frontendUrl}/auth/google-success?token=${token}`);
};

