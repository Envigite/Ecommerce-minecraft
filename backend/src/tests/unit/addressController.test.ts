import { addAddress, deleteAddress, getMyAddresses } from '../../controllers/addressController';
import { AddressModel } from '../../models/addressModel';
import { Request, Response } from 'express';

jest.mock('../../models/addressModel');

describe('Address Controller (Unit)', () => {
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

  //-----* TEST ADD ADDRESS *-----//

  test('addAddress: Debería fallar (400) si faltan campos obligatorios', async () => {
    req.body = { alias: "Casa" }; 

    await addAddress(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: "Datos inválidos" 
    }));
    expect(AddressModel.create).not.toHaveBeenCalled();
  });

  test('addAddress: Debería fallar (400) si contiene caracteres HTML prohibidos (< >)', async () => {
    req.body = {
      alias: "<script>alert('hack')</script>", 
      street: "Calle Falsa",
      number: "123",
      city: "Santiago",
      region: "RM"
    };

    await addAddress(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: expect.stringMatching(/No se permiten/i) 
    }));
  });

  test('addAddress: Debería crear la dirección si los datos son válidos', async () => {
    req.body = {
      alias: "Oficina",
      street: "Av. Siempre Viva",
      number: "742",
      city: "Springfield",
      region: "Metropolitana",
      isDefault: false
    };

    const mockSavedAddr = { ...req.body, id: 'addr_1', user_id: 'user_123' };
    (AddressModel.create as jest.Mock).mockResolvedValue(mockSavedAddr);

    await addAddress(req as Request, res as Response);

    expect(AddressModel.create).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user_123',
      street: "Av. Siempre Viva",
      number: "742"
    }));
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSavedAddr);
  });

  //-----* TEST DELETE ADDRESS *-----//

  test('deleteAddress: Debería eliminar solo si pertenece al usuario', async () => {
    req.params = { id: 'addr_borrar' };

    (AddressModel.delete as jest.Mock).mockResolvedValue(true);

    await deleteAddress(req as Request, res as Response);

    expect(AddressModel.delete).toHaveBeenCalledWith('addr_borrar', 'user_123');    
    expect(res.json).toHaveBeenCalledWith({ message: "Dirección eliminada" });
  });

  test('deleteAddress: Debería devolver 404 si la dirección no existe', async () => {
    req.params = { id: 'addr_fantasma' };
    (AddressModel.delete as jest.Mock).mockResolvedValue(false);

    await deleteAddress(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
  
  //-----* TEST GET MY ADDRESSES *-----//

  test('getMyAddresses: Debería devolver la lista de direcciones', async () => {
    const mockAddresses = [{ id: 'a1', city: 'Santiago' }];
    (AddressModel.findByUser as jest.Mock).mockResolvedValue(mockAddresses);

    await getMyAddresses(req as Request, res as Response);

    expect(AddressModel.findByUser).toHaveBeenCalledWith('user_123');
    expect(res.json).toHaveBeenCalledWith(mockAddresses);
  });

});