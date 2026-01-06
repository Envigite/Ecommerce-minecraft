import { getLogs } from '../../controllers/auditController';
import { AuditModel } from '../../models/auditModel';
import { Request, Response } from 'express';

jest.mock('../../models/auditModel');

describe('Audit Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {}; 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  //-----* TEST GET LOGS *-----//

  test('getLogs: Debería devolver los últimos 100 logs (Status 200)', async () => {
    const mockLogs = [
      { id: 1, action: 'LOGIN', details: {} },
      { id: 2, action: 'DELETE_PRODUCT', details: { id: 'p1' } }
    ];
    (AuditModel.getLogs as jest.Mock).mockResolvedValue(mockLogs);

    await getLogs(req as Request, res as Response);

    expect(AuditModel.getLogs).toHaveBeenCalledWith(100);    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockLogs);
  });

  test('getLogs: Debería devolver 500 si la base de datos falla', async () => {
    (AuditModel.getLogs as jest.Mock).mockRejectedValue(new Error('DB Connection Failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await getLogs(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error interno del servidor" });

    consoleSpy.mockRestore();
  });

});