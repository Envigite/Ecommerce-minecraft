import { RequestHandler } from "express";
import { productSchema } from "../schemas/productSchema";
import { ProductModel } from "../models/productModel";
import { logAction } from "../utils/auditLogger";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const listProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await ProductModel.listProductsModel();
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const parseResult = productSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Datos invalidos",
        details: parseResult.error.issues,
      })
    }

    const data = parseResult.data;
    const product = await ProductModel.createProductModel(data);

    await logAction(authReq.user?.id, "ACTIONS.CREATE_PRODUCT", "product", product.id, { name: product.name });

    return res.status(201).json(product);

  } catch (err) {
    console.error("Error al crear producto:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export const getProductById: RequestHandler = async (req, res) => {
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
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    
    const parseResult = productSchema.partial().safeParse(req.body);
    if (!parseResult.success) return res.status(400).json({ error: "Datos inválidos", details: parseResult.error.issues });

    const oldProduct: any = await ProductModel.getProductByIdModel(id);
    if (!oldProduct) return res.status(404).json({ error: "Producto no encontrado" });

    const updated = await ProductModel.updateProductModel(id, parseResult.data);
    if (!updated) return res.status(404).json({ error: "Error al actualizar" });

    const changes: Record<string, any> = {};
    const newData = parseResult.data;

    Object.keys(newData).forEach((key) => {
      // @ts-ignore
      const newValue = newData[key];
      const oldValue = oldProduct[key];
      
      if (newValue != oldValue) {
        changes[key] = {
          from: oldValue,
          to: newValue
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      await logAction(authReq.user?.id, "UPDATE_PRODUCT", "product", id, changes);
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error interno" });
  }
}

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto" });
    }
    const deleted = await ProductModel.deleteProductModel(id);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });

    await logAction(authReq.user?.id, "ACTIONS.DELETE_PRODUCT", "product", id);

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

