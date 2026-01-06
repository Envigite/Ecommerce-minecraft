import { getCart, addToCart, mergeCart, removeCartItem } from '../../controllers/cartController';
import { CartModel } from '../../models/cartModel';
import { Request, Response } from 'express';

jest.mock('../../models/cartModel');

describe('Cart Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { user: { id: 'user_123', role: 'user' }, body: {}, params: {} } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  //-----* TEST GET CART *-----//

  test('getCart: Debería devolver ítems y calcular el TOTAL correctamente', async () => {
    const mockItems = [
      { id: 'p1', name: 'Polera', price: 1000, quantity: 2, subtotal: 2000 },
      { id: 'p2', name: 'Gorro', price: 5000, quantity: 1, subtotal: 5000 }
    ];
    (CartModel.getUserCart as jest.Mock).mockResolvedValue(mockItems);

    await getCart(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith({
      items: mockItems,
      total: 7000
    });
  });

  //-----* TEST ADD TO CART *-----//

  test('addToCart: Debería fallar (400) si la cantidad es menor a 1', async () => {
    req.body = { product_id: 'p1', quantity: 0 };

    await addToCart(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(CartModel.addOrUpdateItem).not.toHaveBeenCalled();
  });

  test('addToCart: Debería agregar ítem si los datos son válidos', async () => {
    req.body = { product_id: 'p1', quantity: 1 };
    (CartModel.addOrUpdateItem as jest.Mock).mockResolvedValue({ id: 'p1', quantity: 1 });

    await addToCart(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(CartModel.addOrUpdateItem).toHaveBeenCalledWith('user_123', 'p1', 1);
  });

  //-----* TEST MERGE CART *-----//

  test('mergeCart: Debería SUMAR cantidades de DB y Local Storage', async () => {
    req.body = { 
      items: [
        { id: 'p1', quantity: 2 },
        { id: 'p2', quantity: 1 }
      ] 
    };

    (CartModel.getUserCart as jest.Mock)
      .mockResolvedValueOnce([{ id: 'p1', quantity: 1 }])
      .mockResolvedValueOnce([]);

    (CartModel.clearUserCart as jest.Mock).mockResolvedValue(true);
    (CartModel.addOrUpdateItem as jest.Mock).mockResolvedValue(true);

    await mergeCart(req as Request, res as Response);

    expect(CartModel.addOrUpdateItem).toHaveBeenCalledWith('user_123', 'p1', 3);
    expect(CartModel.addOrUpdateItem).toHaveBeenCalledWith('user_123', 'p2', 1);
    expect(CartModel.clearUserCart).toHaveBeenCalledWith('user_123');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  //-----* TEST REMOVE ITEM *-----//

  test('removeCartItem: Debería devolver 404 si el ítem no existe', async () => {
    req.params = { product_id: 'no_existe' };
    (CartModel.removeItem as jest.Mock).mockResolvedValue(false);

    await removeCartItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('removeCartItem: Debería devolver 204 si elimina correctamente', async () => {
    req.params = { product_id: 'p1' };
    (CartModel.removeItem as jest.Mock).mockResolvedValue(true);

    await removeCartItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(204);
  });

});