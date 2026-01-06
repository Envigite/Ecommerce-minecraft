process.env.JWT_SECRET = 'test_secret_dummy';

import { authenticateJWT } from '../../middlewares/authMiddleware';
import { authorizeRole } from '../../middlewares/roleMiddleware';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

jest.mock('jsonwebtoken');

describe('Middlewares (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { cookies: {}, user: undefined } as any;
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    next = jest.fn();
    jest.clearAllMocks();
  });

  //-----* TEST AUTHENTICATE JWT *-----//

  describe('authenticateJWT', () => {

    test('Debería llamar a next() y setear req.user si el token es VÁLIDO', () => {
      req.cookies = { token: 'token_valido' };
      
      const mockPayload = { id: 'user_1', role: 'admin' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authenticateJWT(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith('token_valido', 'test_secret_dummy');
      expect((req as any).user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    test('Debería devolver 401 si NO hay token', () => {
      req.cookies = {};

      authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "No hay sesión activa" });
      expect(next).not.toHaveBeenCalled();
    });

    test('Debería devolver 401 y "Token expirado" si jwt lanza TokenExpiredError', () => {
      req.cookies = { token: 'token_expirado' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token expirado" });
      expect(next).not.toHaveBeenCalled();
    });

    test('Debería devolver 401 y "Token inválido" para otros errores', () => {
      req.cookies = { token: 'token_basura' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JsonWebTokenError');
      });

      authenticateJWT(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    });
  });

  //-----* TEST AUTHORIZE ROLE *-----//

  describe('authorizeRole', () => {

    test('Debería permitir acceso (next) si el rol está permitido', () => {
      req.user = { id: '1', role: 'admin' };

      const middleware = authorizeRole(['admin', 'manager']);
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    test('Debería denegar acceso (403) si el rol NO está permitido', () => {
      req.user = { id: '2', role: 'user' };

      const middleware = authorizeRole(['admin']);
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Acceso denegado" });
      expect(next).not.toHaveBeenCalled();
    });

    test('Debería denegar acceso (403) si NO hay usuario en req (bug de seguridad)', () => {
      req.user = undefined;

      const middleware = authorizeRole(['admin']);
      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

  });
});