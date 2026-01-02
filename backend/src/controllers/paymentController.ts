import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { OrderModel } from '../models/orderModel';
import { AddressModel } from '../models/addressModel';
import { ICreateOrder } from '../types/models';

const SHIPPING_COST = 3990;

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN as string 
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items, addressId, deliveryType } = req.body; 

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    
    if (deliveryType === 'shipping') {
        if (!addressId) {
            return res.status(400).json({ error: 'Se requiere una dirección para envío a domicilio' });
        }
        const addressExists = await AddressModel.findById(addressId);
        if (!addressExists) {
            return res.status(400).json({ error: 'La dirección no es válida' });
        }
    }

    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

    const itemsTotal = items.reduce((acc: number, item: any) => {
      return acc + (Number(item.price) * Number(item.quantity));
    }, 0);

    const shippingPrice = deliveryType === 'shipping' ? SHIPPING_COST : 0;
    const finalTotal = itemsTotal + shippingPrice;

    const orderData: ICreateOrder = {
      user_id: userId,
      total: finalTotal,
      delivery_type: deliveryType || 'pickup',
      address_id: deliveryType === 'shipping' ? addressId : undefined,
      payment_method: 'mercadopago',
      items: items.map((item: any) => ({
        product_id: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    };

    const newOrder = await OrderModel.create(orderData);
    console.log(`🧾 Orden creada en DB: ${newOrder.id} (Pending) | Total: ${finalTotal}`);

    const mpItems = items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Math.round(Number(item.price)), 
        currency_id: 'CLP',
        picture_url: item.image || ''
    }));

    if (deliveryType === 'shipping') {
        mpItems.push({
            id: 'shipping_cost',
            title: 'Despacho a Domicilio',
            quantity: 1,
            unit_price: SHIPPING_COST,
            currency_id: 'CLP',
            picture_url: 'https://cdn-icons-png.flaticon.com/512/756/756940.png' // Icono genérico de camión
        });
    }

    const preference = new Preference(client);

    console.log("🔗 Configurando URLs:", {
      success: `${CLIENT_URL}/checkout/success?order_id=${newOrder.id}`,
      webhook: `${process.env.WEBHOOK_URL}/api/payments/webhook`
    });

    const result = await preference.create({
      body: {
        items: mpItems,
        external_reference: newOrder.id,
        notification_url: `${process.env.WEBHOOK_URL}/api/payments/webhook`,
        back_urls: {
          success: `${CLIENT_URL}/checkout/success?order_id=${newOrder.id}`, 
          failure: `${CLIENT_URL}/checkout/failure?order_id=${newOrder.id}`,
          pending: `${CLIENT_URL}/checkout/pending?order_id=${newOrder.id}`,
        },
        auto_return: process.env.NODE_ENV === 'production' ? 'approved' : undefined,
        metadata: { 
          user_id: userId,
          order_id: newOrder.id
        },
      }
    });

    res.json({ 
      url: result.init_point, 
      orderId: newOrder.id
    });

  } catch (error: any) {
    console.error('Error en pago:', error);
    res.status(500).json({ error: 'Error al procesar pago', details: error.message });
  }
};

export const handlePaymentSuccess = async (req: Request, res: Response) => {
    try {
        const { orderId, paymentId, status } = req.body;
        if (!orderId || !paymentId) return res.status(400).json({ error: "Faltan datos" });
        if (status === 'approved') {
          await OrderModel.updateStatus(orderId, 'paid', paymentId);
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error interno" }); }
};

export const receiveWebhook = async (req: Request, res: Response) => {
    const { type, data } = req.body; 
    const paymentId = data?.id || req.query['data.id'] || req.query.id;
    const topic = type || req.query.topic || req.query.type;
  
    try {
      if (topic === 'payment' || topic === 'payment.created') {
        if (!paymentId) return res.sendStatus(200);
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });
        const status = paymentData.status;
        const orderId = paymentData.external_reference;
        if (status === 'approved' && orderId) {
          await OrderModel.updateStatus(orderId, 'paid', paymentId);
        }
      }
      res.sendStatus(200);
    } catch (error) { res.sendStatus(500); }
};