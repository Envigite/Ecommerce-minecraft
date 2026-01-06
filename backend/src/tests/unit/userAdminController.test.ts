import { changeUserRole, deleteUser, listUsers } from '../../controllers/userController';
import { UserModel } from '../../models/userModel';
import { logAction } from '../../utils/auditLogger';
import { Request, Response } from 'express';

jest.mock('../../models/userModel');
jest.mock('../../utils/auditLogger');

describe('User Admin Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { 
      params: {}, 
      body: {}, 
      user: { id: 'admin_1', role: 'admin' } 
    } as any;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  //-----* TEST CHANGE ROLE *-----//

  test('changeUserRole: Debería cambiar el rol y LOGUEAR la acción', async () => {
    req.params = { id: 'target_user' };
    req.body = { role: 'manager' };

    (UserModel.updateUserRoleModel as jest.Mock).mockResolvedValue({ 
      id: 'target_user', 
      role: 'manager' 
    });

    await changeUserRole(req as Request, res as Response);

    expect(UserModel.updateUserRoleModel).toHaveBeenCalledWith('target_user', 'manager');
    expect(logAction).toHaveBeenCalledWith(
      'admin_1',
      "ACTIONS.ROLE_CHANGE",
      "user", 
      'target_user',
      { new_role: 'manager' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('changeUserRole: Debería fallar (400) si el rol es INVÁLIDO', async () => {
    req.params = { id: 'target_user' };
    req.body = { role: 'SUPER_DIOS' };

    await changeUserRole(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: expect.stringMatching(/Rol inválido/i) 
    }));
    expect(UserModel.updateUserRoleModel).not.toHaveBeenCalled();
  });

  test('changeUserRole: Debería dar 404 si el usuario no existe', async () => {
    req.params = { id: 'fantasma' };
    req.body = { role: 'user' };

    (UserModel.updateUserRoleModel as jest.Mock).mockResolvedValue(null);

    await changeUserRole(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  //-----* TEST DELETE USER *-----//

  test('deleteUser: Debería eliminar usuario y registrar auditoría', async () => {
    req.params = { id: 'user_to_delete' };

    (UserModel.deleteUserModel as jest.Mock).mockResolvedValue(true);

    await deleteUser(req as Request, res as Response);

    expect(UserModel.deleteUserModel).toHaveBeenCalledWith('user_to_delete');
    expect(logAction).toHaveBeenCalledWith(
        'admin_1', 
        "ACTIONS.DELETE_USER", 
        "user", 
        'user_to_delete'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deleteUser: Debería dar 404 si el usuario ya no existe', async () => {
    req.params = { id: 'ya_borrado' };
    (UserModel.deleteUserModel as jest.Mock).mockResolvedValue(false);

    await deleteUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(logAction).not.toHaveBeenCalled();
  });

  //-----* TEST LIST USERS *-----//

  test('listUsers: Debería devolver la lista de usuarios (200)', async () => {
    const mockUsers = [{ id: 1, email: 'a@a.com' }, { id: 2, email: 'b@b.com' }];
    (UserModel.listUsersModel as jest.Mock).mockResolvedValue(mockUsers);

    await listUsers(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

});