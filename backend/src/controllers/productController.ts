import type { Request, Response } from "express";
import { productSchema } from "../schemas/productSchema";
import { ProductModel } from "../models/productModel";

export const listProducts = async (_req: Request, res: Response) => {
  try {
    const products = await ProductModel.listProductsModel();
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const parseResult = productSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Datos invalidos",
        details: parseResult.error.issues,
      })
    }

    const data = parseResult.data;

    const product = await ProductModel.createProductModel(data);

    return res.status(201).json(product);

  } catch (err) {
    console.error("Error al crear producto:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto" });
    }
    const product  = await ProductModel.getProductByIdModel(id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return res.status(500).json({ error: "Error interno del servidor" });;
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto" });
    }
    const parseResult = productSchema.partial().safeParse(req.body);

    if (!parseResult.success)
      return res.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });

    const updated = await ProductModel.updateProductModel(id, parseResult.data);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto" });
    }
    const deleted = await ProductModel.deleteProductModel(id);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

