import { createMessage, getMessages, updateMessageStatus } from '../../controllers/contactController';
import { ContactModel } from '../../models/contactModel';
import { EmailService } from '../../services/emailService';
import { Request, Response } from 'express';

jest.mock('resend');
jest.mock('../../models/contactModel');
jest.mock('../../services/emailService');

describe('Contact Controller (Unit)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {}, params: {} } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  //-----* TEST CREATE MESSAGE *-----//

  test('createMessage: Debería guardar mensaje y ENVIAR AUTO-REPLY', async () => {
    req.body = {
      name: "Cliente Feliz",
      email: "cliente@test.com",
      subject: "Consulta sobre producto",
      message: "Hola, quisiera saber si tienen stock de la polera XL."
    };

    const mockSavedMessage = { ...req.body, id: 1, created_at: new Date() };
    (ContactModel.create as jest.Mock).mockResolvedValue(mockSavedMessage);

    await createMessage(req as Request, res as Response);

    expect(ContactModel.create).toHaveBeenCalledWith(expect.objectContaining({
      email: "cliente@test.com",
      userId: null
    }));
    expect(EmailService.sendContactAutoReply).toHaveBeenCalledWith(
      "cliente@test.com", 
      "Cliente Feliz"
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('createMessage: Debería fallar (400) si hay HTML (XSS Attack)', async () => {
    req.body = {
      name: "Hacker",
      email: "hack@bad.com",
      subject: "Te ganaste un premio",
      message: "Haz click aquí: <a href='virus'>Click</a>"
    };

    await createMessage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Datos inválidos"
    }));

    expect(ContactModel.create).not.toHaveBeenCalled();
    expect(EmailService.sendContactAutoReply).not.toHaveBeenCalled();
  });

  test('createMessage: Debería fallar (400) si el mensaje es muy corto', async () => {
    req.body = {
      name: "Juan",
      email: "juan@test.com",
      subject: "Hola",
      message: "Corto"
    };

    await createMessage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  //-----* TEST UPDATE STATUS *-----//

  test('updateStatus: Debería actualizar si el estado es válido (replied)', async () => {
    req.params = { id: 'msg_1' };
    req.body = { status: 'replied' };

    (ContactModel.updateStatus as jest.Mock).mockResolvedValue({ id: 'msg_1', status: 'replied' });

    await updateMessageStatus(req as Request, res as Response);

    expect(ContactModel.updateStatus).toHaveBeenCalledWith('msg_1', 'replied');
    expect(res.json).toHaveBeenCalled();
  });

  test('updateStatus: Debería fallar (400) si el estado es INVÁLIDO', async () => {
    req.params = { id: 'msg_1' };
    req.body = { status: 'visto_por_el_jefe' };

    await updateMessageStatus(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Estado inválido" }));

    expect(ContactModel.updateStatus).not.toHaveBeenCalled();
  });

  test('updateStatus: Debería dar 404 si el mensaje no existe', async () => {
    req.params = { id: 'msg_fantasma' };
    req.body = { status: 'replied' };

    (ContactModel.updateStatus as jest.Mock).mockResolvedValue(null);

    await updateMessageStatus(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  //-----* TEST GET MESSAGES *-----//

  test('getMessages: Debería devolver la lista de mensajes', async () => {
    (ContactModel.getAll as jest.Mock).mockResolvedValue([]);
    
    await getMessages(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith([]);
  });

});