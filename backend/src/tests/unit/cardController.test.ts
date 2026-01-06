import { addCard, deleteCard, getMyCards } from '../../controllers/cardController';
import { CardModel } from '../../models/cardModel';
import { Request, Response } from 'express';

jest.mock('../../models/cardModel');

describe('Card Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { 
      user: { id: 'user_123' }, 
      body: {}, 
      params: {} 
    } as any;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

   //-----* TEST ADD CARD *-----//

  test('addCard: Debería fallar (400) si los datos son inválidos (Zod)', async () => {
    req.body = {}; 

    await addCard(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: "Datos inválidos" 
    }));
    expect(CardModel.create).not.toHaveBeenCalled();
  });

  test('addCard: Debería guardar la tarjeta si los datos son correctos', async () => {
    req.body = {
      last4: "1234",
      name: "Juan Perez",
      brand: "visa"
    };

    const mockSavedCard = { ...req.body, id: 'card_1', user_id: 'user_123' };
    (CardModel.create as jest.Mock).mockResolvedValue(mockSavedCard);

    await addCard(req as Request, res as Response);

    expect(CardModel.create).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user_123',
      name: "Juan Perez",
      last4: "1234",
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSavedCard);
  });

   //-----* TEST DELETE CARD *-----//

  test('deleteCard: Debería eliminar solo si pertenece al usuario', async () => {
    req.params = { id: 'card_to_delete' };

    (CardModel.delete as jest.Mock).mockResolvedValue(true);

    await deleteCard(req as Request, res as Response);

    expect(CardModel.delete).toHaveBeenCalledWith('card_to_delete', 'user_123');
    
    expect(res.json).toHaveBeenCalledWith({ message: "Tarjeta eliminada" });
  });

  test('deleteCard: Debería devolver 404 si la tarjeta no existe o no es del usuario', async () => {
    req.params = { id: 'card_ajena' };

    (CardModel.delete as jest.Mock).mockResolvedValue(false);

    await deleteCard(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

   //-----* TEST GET CARDS *-----//

  test('getMyCards: Debería devolver la lista de tarjetas', async () => {
    const mockCards = [{ id: 'c1', brand: 'visa' }];
    (CardModel.findByUser as jest.Mock).mockResolvedValue(mockCards);

    await getMyCards(req as Request, res as Response);

    expect(CardModel.findByUser).toHaveBeenCalledWith('user_123');
    expect(res.json).toHaveBeenCalledWith(mockCards);
  });

});