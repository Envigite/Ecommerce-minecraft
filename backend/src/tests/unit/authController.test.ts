import { loginUser, registerUser, logoutUser, getUserProfile, updatePasswordController } from '../../controllers/authController';
import { UserModel } from '../../models/userModel';
import { AddressModel } from '../../models/addressModel';
import { CardModel } from '../../models/cardModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('../../models/userModel');
jest.mock('../../models/addressModel');
jest.mock('../../models/cardModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller (Unit Tests)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });
  
  //-----* TEST LOGIN *-----//

  test('Login: Debería devolver 401 si el usuario NO existe', async () => {
    req.body = { email: 'noexiste@test.com', password: 'password123' };
    (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

    await loginUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/inválid/i) }));
  });

  test('Login: Debería devolver 401 si la contraseña es INCORRECTA', async () => {
    req.body = { email: 'existente@test.com', password: 'Password123' };
    
    (UserModel.findByEmail as jest.Mock).mockResolvedValue({ 
      id: '1', email: 'existente@test.com', password_hash: 'hash_real' 
    });
    
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await loginUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('Login: Debería devolver 200 y Token si todo es CORRECTO', async () => {
    req.body = { email: 'ok@test.com', password: 'Correctpassword123' };
    
    (UserModel.findByEmail as jest.Mock).mockResolvedValue({ 
      id: '123', username: 'Tester', email: 'ok@test.com', password_hash: 'hash_valido', role: 'user' 
    });
    
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    (jwt.sign as jest.Mock).mockReturnValue('token_falso_super_seguro');

    await loginUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        email: 'ok@test.com', 
        username: 'Tester' 
    }));
  });

  //-----* TEST REGISTER *-----//

  test('Register: Debería devolver 409 si el usuario YA existe', async () => {
    req.body = { username: 'duplicado', email: 'duplicado@test.com', password: 'Password123', confirmPassword: 'Password123' };
    
    (UserModel.findByEmailOrUsername as jest.Mock).mockResolvedValue({ email: 'duplicado@test.com' });

    await registerUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/registrado/i) }));
  });

  test('Register: Debería devolver 201 si el usuario es NUEVO', async () => {
    req.body = { username: 'nuevo', email: 'nuevo@test.com', password: 'Password123', confirmPassword: 'Password123' };

    (UserModel.findByEmailOrUsername as jest.Mock).mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hash_secreto');

    (UserModel.createUser as jest.Mock).mockResolvedValue({ 
      id: '999', username: 'nuevo', email: 'nuevo@test.com', role: 'user' 
    });

    await registerUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
  });

  //-----* TEST LOGOUT *-----//

  test('Logout: Debería limpiar la cookie y cerrar sesión exitosamente', () => {
    
    logoutUser(req as Request, res as Response);

    expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith("token", "", expect.objectContaining({
        expires: expect.any(Date)
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Sesión cerrada" });
  });

  //-----* TEST USER PROFILE *-----//

  test('Profile: Debería devolver usuario + direcciones + tarjetas', async () => {
    req.user = { id: 'user_123', role: 'user' };

    (UserModel.getUserById as jest.Mock).mockResolvedValue({ id: 'user_123', email: 'test@test.com' });
    (AddressModel.findByUser as jest.Mock).mockResolvedValue([{ city: 'Santiago' }]); 
    (CardModel.findByUser as jest.Mock).mockResolvedValue([{ last4: '4242' }]);

    await getUserProfile(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@test.com',
      addresses: expect.arrayContaining([{ city: 'Santiago' }]),
      cards: expect.arrayContaining([{ last4: '4242' }])
    }));
  });

  test('Profile: Debería devolver 404 si el usuario no existe en DB', async () => {
    req.user = { id: 'user_fantasma', role: 'user' };

    (UserModel.getUserById as jest.Mock).mockResolvedValue(null); 

    await getUserProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  //-----* TEST UPDATE PASSWORD *-----//
  
  test('Update Password: Debería actualizar contraseña correctamente', async () => {
    req.user = { id: 'user_123', role: 'user' };
    req.body = { password: 'NewPass123', confirmPassword: 'NewPass123' };
    
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash_nuevo_seguro');
    (UserModel.updateUser as jest.Mock).mockResolvedValue({ id: 'user_123' });

    await updatePasswordController(req as Request, res as Response);

    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
    expect(UserModel.updateUser).toHaveBeenCalledWith('user_123', undefined, 'hash_nuevo_seguro');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/actualizada/i) }));
  });
});