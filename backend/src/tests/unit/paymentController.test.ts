import { createCheckoutSession, receiveWebhook } from '../../controllers/paymentController';
import { OrderModel } from '../../models/orderModel';
import { AddressModel } from '../../models/addressModel';
import { ProductModel } from '../../models/productModel';
import { Preference, Payment } from 'mercadopago';
import { Request, Response } from 'express';


jest.mock('../../models/orderModel');
jest.mock('../../models/addressModel');
jest.mock('../../models/productModel');

jest.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn().mockImplementation(() => ({
      create: jest.fn()
    })),
    Payment: jest.fn().mockImplementation(() => ({
      get: jest.fn()
    }))
  };
});

describe('Payment Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { user: { id: 'user_123' }, body: {}, query: {} } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    };
    jest.clearAllMocks();
  });

  //-----* TEST CREAR ORDEN *-----//

  describe('createCheckoutSession', () => {
    
    test('Debería fallar si el carrito está vacío', async () => {
      req.body = { items: [] };
      await createCheckoutSession(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debería fallar si pide envío pero no manda dirección', async () => {
      req.body = { items: [{ id: 1, price: 100, quantity: 1 }], deliveryType: 'shipping' };
      await createCheckoutSession(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debería crear orden y devolver URL de MP (Delivery Normal)', async () => {
      req.body = { 
        items: [{ id: 'prod_1', name: 'Polera', price: 10000, quantity: 2 }],
        deliveryType: 'pickup' 
      };

      (OrderModel.create as jest.Mock).mockResolvedValue({ id: 'order_999' });

      const MockPreference = Preference as unknown as jest.Mock;
      const createMock = jest.fn().mockResolvedValue({ init_point: 'https://mercadopago.fake/checkout' });
      MockPreference.mockImplementation(() => ({ create: createMock }));

      await createCheckoutSession(req as Request, res as Response);

      expect(OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({
        total: 20000,
        delivery_type: 'pickup'
      }));
      expect(res.json).toHaveBeenCalledWith({ url: 'https://mercadopago.fake/checkout', orderId: 'order_999' });
    });

    test('Debería sumar el costo de envío al total', async () => {
      req.body = { 
        items: [{ id: 'prod_1', price: 10000, quantity: 1 }],
        deliveryType: 'shipping',
        addressId: 'addr_1'
      };

      (AddressModel.findById as jest.Mock).mockResolvedValue(true);
      (OrderModel.create as jest.Mock).mockResolvedValue({ id: 'order_888' });
      
      (Preference as unknown as jest.Mock).mockImplementation(() => ({ 
          create: jest.fn().mockResolvedValue({ init_point: 'url' }) 
      }));

      await createCheckoutSession(req as Request, res as Response);

      expect(OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({
        total: 13990 
      }));
    });
  });

  //-----* TEST WEBHOOK *-----//

  describe('receiveWebhook', () => {

    test('Debería ignorar notificaciones que no sean de pago', async () => {
      req.body = { type: 'subscription', data: { id: '123' } };
      await receiveWebhook(req as Request, res as Response);
      
      expect(OrderModel.updateStatus).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('Debería actualizar orden y BAJAR STOCK si el pago es APROBADO', async () => {
      req.body = { type: 'payment', data: { id: 'payment_real_123' } };

      const mockGetPayment = jest.fn().mockResolvedValue({
        status: 'approved',
        external_reference: 'order_555'
      });
      (Payment as unknown as jest.Mock).mockImplementation(() => ({ get: mockGetPayment }));

      (OrderModel.findByIdAdmin as jest.Mock).mockResolvedValue({
        id: 'order_555',
        status: 'pending',
        items: [
          { product_id: 'prod_A', quantity: 2 },
          { product_id: 'prod_B', quantity: 1 }
        ]
      });

      await receiveWebhook(req as Request, res as Response);

      expect(OrderModel.updateStatus).toHaveBeenCalledWith('order_555', 'paid', 'payment_real_123');
      expect(ProductModel.decreaseStock).toHaveBeenCalledTimes(2);
      expect(ProductModel.decreaseStock).toHaveBeenCalledWith('prod_A', 2);
      expect(ProductModel.decreaseStock).toHaveBeenCalledWith('prod_B', 1);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('NO debería bajar stock si la orden YA estaba pagada (Idempotencia)', async () => {
      req.body = { type: 'payment', data: { id: 'payment_123' } };

      const mockGetPayment = jest.fn().mockResolvedValue({ status: 'approved', external_reference: 'order_YA_PAGADA' });
      (Payment as unknown as jest.Mock).mockImplementation(() => ({ get: mockGetPayment }));

      (OrderModel.findByIdAdmin as jest.Mock).mockResolvedValue({
        id: 'order_YA_PAGADA',
        status: 'paid',
        items: [{ product_id: 'prod_A', quantity: 1 }]
      });

      await receiveWebhook(req as Request, res as Response);

      expect(OrderModel.updateStatus).not.toHaveBeenCalled();
      expect(ProductModel.decreaseStock).not.toHaveBeenCalled();
    });
  });

});