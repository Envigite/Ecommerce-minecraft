import { createOrder, updateOrderStatusAdmin, deleteOrderAdmin } from '../../controllers/orderController';
import { OrderModel } from '../../models/orderModel';
import { logAction } from '../../utils/auditLogger';
import { Request, Response } from 'express';

jest.mock('../../models/orderModel');
jest.mock('../../utils/auditLogger');

describe('Order Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { user: { id: 'user_123', role: 'user' }, body: {}, params: {} } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  //-----* TEST CREAR ORDEN *-----//

  test('CreateOrder: Debería fallar (409) si NO hay Stock suficiente', async () => {
    req.body = { items: [{ id: 1, quantity: 10 }] };
    
    (OrderModel.validateStock as jest.Mock).mockRejectedValue({ message: 'Sin stock' });

    await createOrder(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sin stock' });
    expect(OrderModel.create).not.toHaveBeenCalled();
  });

  test('CreateOrder: Debería sumar envío (3990) si deliveryType es shipping', async () => {
    req.body = {
      items: [{ id: 1, price: 1000, quantity: 1 }],
      deliveryType: 'shipping',
      addressId: 'addr_1',
      paymentMethodId: 'cash'
    };

    (OrderModel.validateStock as jest.Mock).mockResolvedValue(true);
    (OrderModel.create as jest.Mock).mockResolvedValue({ id: 'order_new' });

    await createOrder(req as Request, res as Response);

    expect(OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({
      total: 4990,
      delivery_type: 'shipping'
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('CreateOrder: NO debería sumar envío si es pickup', async () => {
    req.body = {
      items: [{ id: 1, price: 1000, quantity: 1 }],
      deliveryType: 'pickup',
      paymentMethodId: 'cash'
    };

    (OrderModel.validateStock as jest.Mock).mockResolvedValue(true);
    
    await createOrder(req as Request, res as Response);

    expect(OrderModel.create).toHaveBeenCalledWith(expect.objectContaining({
      total: 1000,
      delivery_type: 'pickup'
    }));
  });

  //-----* TEST ADMIN *-----//

  test('UpdateStatus: Debería actualizar estado y CREAR LOG de auditoría', async () => {
    req.params = { id: 'order_123' };
    req.body = { status: 'shipped' };
    req.user = { id: 'admin_1', role: 'admin' };

    (OrderModel.updateStatus as jest.Mock).mockResolvedValue({ id: 'order_123', status: 'shipped' });

    await updateOrderStatusAdmin(req as Request, res as Response);

    expect(OrderModel.updateStatus).toHaveBeenCalledWith('order_123', 'shipped');
    expect(logAction).toHaveBeenCalledWith(
      'admin_1',
      'UPDATE_STATUS',
      'ORDER',
      'order_123',
      expect.objectContaining({ newStatus: 'shipped' })
    );
    expect(res.json).toHaveBeenCalled();
  });

  test('UpdateStatus: Debería fallar (400) si el estado es inválido', async () => {
    req.body = { status: 'ESTADO_INVENTADO_NO_EXISTE' };
    
    await updateOrderStatusAdmin(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(OrderModel.updateStatus).not.toHaveBeenCalled();
  });

  test('DeleteOrder: Debería eliminar y registrar auditoría', async () => {
    req.params = { id: 'order_borrar' };
    req.user = { id: 'admin_1', role: 'admin' };

    (OrderModel.delete as jest.Mock).mockResolvedValue(true);

    await deleteOrderAdmin(req as Request, res as Response);

    expect(OrderModel.delete).toHaveBeenCalledWith('order_borrar');
    expect(logAction).toHaveBeenCalledWith(
        'admin_1', 
        'DELETE', 
        'ORDER', 
        'order_borrar', 
        expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Orden eliminada correctamente" });
  });

});