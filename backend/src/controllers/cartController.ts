import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { CartModel } from "../models/cartModel";

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const items = await CartModel.getUserCart(userId!);
  const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
  return res.status(200).json({ items, total });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1)
    return res.status(400).json({ error: "Datos inválidos" });

  const item = await CartModel.addOrUpdateItem(userId!, product_id, quantity);
  return res.status(201).json(item);
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1)
    return res.status(400).json({ error: "Datos inválidos" });

  const updated = await CartModel.updateQuantity(userId!, product_id, quantity);
  if (!updated) return res.status(404).json({ error: "Item no encontrado" });
  return res.status(200).json(updated);
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { product_id } = req.params;

  if (!product_id)
    return res.status(400).json({ error: "Falta el ID del producto" });

  const ok = await CartModel.removeItem(userId!, product_id);
  if (!ok) return res.status(404).json({ error: "Item no encontrado" });
  return res.status(204).send();
};

export const mergeCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { items: localItems } = req.body;

  if (!localItems || !Array.isArray(localItems)) {
    return res.status(400).json({ error: "Formato inválido" });
  }
  const dbItems = await CartModel.getUserCart(userId!);
  const mergedMap = new Map<string, number>();
  for (const item of dbItems) {
    mergedMap.set(item.id, Number(item.quantity));
  }
  for (const item of localItems) {
    const qty = mergedMap.get(item.id) ?? 0;
    mergedMap.set(item.id, qty + Number(item.quantity));
  }
  await CartModel.clearUserCart(userId!);

  for (const [product_id, quantity] of mergedMap.entries()) {
    await CartModel.addOrUpdateItem(userId!, product_id, quantity);
  }

  const finalItems = await CartModel.getUserCart(userId!);

  const total = finalItems.reduce((acc, i) => acc + Number(i.subtotal), 0);

  return res.status(200).json({ items: finalItems, total });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  await CartModel.clearUserCart(userId!);

  return res.status(204).send();
};


