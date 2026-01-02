import { Request, Response } from "express";
import { OrderModel } from "../models/orderModel";
import { logAction } from "../utils/auditLogger";
import { ORDER_STATUS } from "../constants/orderStatus";
import { randomUUID } from "crypto";

const SHIPPING_COST = 3990;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items, deliveryType, addressId, paymentMethodId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    try {
        await OrderModel.validateStock(items);
    } catch (stockError: any) {
        return res.status(409).json({ message: stockError.message });
    }

    const itemsTotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.price) * Number(item.quantity));
    }, 0);

    const shippingPrice = deliveryType === 'shipping' ? SHIPPING_COST : 0; 
    const finalTotal = itemsTotal + shippingPrice;

    let status = 'pending';
    let generatedPaymentId = null;

    if (paymentMethodId === 'cash') {
        status = 'pending';
        generatedPaymentId = `CASH-${randomUUID().split('-')[0].toUpperCase()}`; 
    } else if (paymentMethodId !== 'mercadopago') {
        status = 'paid';
        generatedPaymentId = `PAY-${randomUUID()}`;
    }

    const newOrder = await OrderModel.create({
      user_id: userId,
      total: finalTotal,
      delivery_type: deliveryType,
      address_id: deliveryType === 'shipping' ? addressId : undefined,
      payment_method: paymentMethodId,
      status: status,
      payment_id: generatedPaymentId,
      items: items.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error createOrder:", error);
    res.status(500).json({ message: "Error al procesar la orden" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const orders = await OrderModel.findByUser(userId);
      res.json(orders);
    } catch (error) { res.status(500).json({ message: "Error al obtener historial" }); }
};
  
export const getOrderById = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const order = await OrderModel.findById(id, userId);
      if (!order) return res.status(404).json({ message: "Orden no encontrada" });
      res.json(order);
    } catch (error) { res.status(500).json({ message: "Error al obtener la orden" }); }
};

export const getAllOrdersAdmin = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string || 'all';
    
    const search = req.query.search as string || ''; 

    const offset = (page - 1) * limit;

    const { orders, total } = await OrderModel.findAll(limit, offset, status, search);

    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error getAllOrdersAdmin:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
  const { status } = req.body;

  const validStatuses = Object.values(ORDER_STATUS);
  if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Estado inválido. Permitidos: ${validStatuses.join(', ')}` 
      });
  }
  
  try {
    const { id } = req.params;
    const adminUser = (req as any).user;

    if (!status) return res.status(400).json({ error: "Estado requerido" });

    const updatedOrder = await OrderModel.updateStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    await logAction(
      adminUser.id,
      "UPDATE_STATUS",
      "ORDER",
      id,
      { newStatus: status, changedBy: adminUser.role }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updateOrderStatusAdmin:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

export const deleteOrderAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user;

    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Solo administradores pueden eliminar registros" });
    }

    const success = await OrderModel.delete(id);

    if (!success) return res.status(404).json({ error: "Orden no encontrada" });

    await logAction(
      adminUser.id,
      "DELETE",
      "ORDER",
      id,
      { reason: "Admin hard delete" }
    );

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteOrderAdmin:", error);
    res.status(500).json({ message: "Error al eliminar orden" });
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const stats = await OrderModel.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getOrderStats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

export const getOrderByIdAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findByIdAdmin(id);
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error getOrderByIdAdmin:", error);
    res.status(500).json({ message: "Error al obtener detalle de la orden" });
  }
};