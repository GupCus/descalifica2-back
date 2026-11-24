import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';

const mockFindOne = vi.fn();
const mockFindOneOrFail = vi.fn();
const mockFlush = vi.fn();
const mockCreate = vi.fn();
const mockPersistAndFlush = vi.fn();
const mockAssign = vi.fn();

const mockSendPasswordChangedEmail = vi.fn();
const mockSendAdminPasswordResetEmail = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      fork: () => ({
        findOne: mockFindOne,
        findOneOrFail: mockFindOneOrFail,
        flush: mockFlush,
        create: mockCreate,
        persistAndFlush: mockPersistAndFlush,
        assign: mockAssign,
      }),
    },
  },
}));

vi.mock('../services/email/email.service.js', () => ({
  sendPasswordChangedEmail: mockSendPasswordChangedEmail,
  sendAdminPasswordResetEmail: mockSendAdminPasswordResetEmail,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

vi.mock('../services/telegram/telegram.service.js', () => ({
  pendingRegistrationLinks: new Map(),
}));

const { sanitizeUsuario, adminResetPassword } = await import(
  '../usuario/usuario.controller.js'
);
const { changePassword, reauthenticate } = await import(
  '../auth/auth.controller.js'
);

describe('Password Security & Separation Tests', () => {
  const JWT_SECRET = 'secret_test_password_security';

  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.EXPIRA_TOKEN = '1h';
    vi.clearAllMocks();
    mockCreate.mockImplementation((_entity, data) => data);
    mockPersistAndFlush.mockResolvedValue(undefined);
    mockFlush.mockResolvedValue(undefined);
    mockSendPasswordChangedEmail.mockResolvedValue({ messageId: 'ok' });
    mockSendAdminPasswordResetEmail.mockResolvedValue({ messageId: 'ok' });
  });

  describe('sanitizeUsuario (separación de cambio de contraseña del perfil)', () => {
    it('Debe rechazar con 400 si se intenta enviar password en el update de perfil', () => {
      const req = {
        body: { name: 'Ignacio', password: 'nuevaPassword123' },
      } as Request;
      const res = createMockResponse();
      const next = vi.fn() as NextFunction;

      sanitizeUsuario(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'PASSWORD_CHANGE_NOT_ALLOWED' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe permitir update de perfil si password viene vacío o ausente y nunca incluirlo en sanitizedInput', () => {
      const req = {
        body: { name: 'Ignacio', password: '' },
      } as Request;
      const res = createMockResponse();
      const next = vi.fn() as NextFunction;

      sanitizeUsuario(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.sanitizedInput).toEqual({ name: 'Ignacio' });
      expect(req.body.sanitizedInput.password).toBeUndefined();
    });
  });

  describe('reauthenticate', () => {
    it('Debe rechazar con 401 si la contraseña actual es incorrecta', async () => {
      const passwordHash = await bcrypt.hash('Correcta123', 4);
      mockFindOne.mockResolvedValue({
        id: 10,
        username: 'nacho10',
        email: 'nacho@test.com',
        user_type: 'user',
        token_version: 1,
        must_change_password: false,
        compare_password: (p: string) => bcrypt.compare(p, passwordHash),
      });

      const req = {
        user: { id: 10, username: 'nacho10', user_type: 'user' },
        body: { password: 'Incorrecta999' },
        headers: {},
      } as AuthenticatedRequest;
      const res = createMockResponse();

      await reauthenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'INVALID_CURRENT_PASSWORD' }),
      );
    });

    it('Debe emitir un nuevo token con auth_time reciente y auditar cuando la contraseña es correcta', async () => {
      const passwordHash = await bcrypt.hash('Correcta123', 4);
      mockFindOne.mockResolvedValue({
        id: 10,
        username: 'nacho10',
        email: 'nacho@test.com',
        user_type: 'user',
        token_version: 3,
        must_change_password: false,
        compare_password: (p: string) => bcrypt.compare(p, passwordHash),
      });

      const req = {
        user: { id: 10, username: 'nacho10', user_type: 'user' },
        body: { password: 'Correcta123' },
        headers: { 'user-agent': 'vitest' },
      } as AuthenticatedRequest;
      const res = createMockResponse();

      await reauthenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responsePayload = (res.json as any).mock.calls[0][0];
      const decoded = jwt.verify(responsePayload.token, JWT_SECRET) as any;
      expect(decoded.token_version).toBe(3);
      expect(typeof decoded.auth_time).toBe('number');
      expect(mockPersistAndFlush).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'REAUTHENTICATION',
          target_user_id: 10,
        }),
      );
    });
  });

  describe('changePassword', () => {
    it('Debe rechazar con 401 si currentPassword no coincide', async () => {
      const passwordHash = await bcrypt.hash('PasswordVieja1', 4);
      mockFindOne.mockResolvedValue({
        id: 5,
        username: 'piloto5',
        email: 'piloto5@test.com',
        user_type: 'user',
        token_version: 0,
        must_change_password: false,
        compare_password: (p: string) => bcrypt.compare(p, passwordHash),
      });

      const req = {
        user: { id: 5, username: 'piloto5', user_type: 'user' },
        body: {
          currentPassword: 'OtraPassword',
          newPassword: 'PasswordNueva2',
        },
        headers: {},
      } as AuthenticatedRequest;
      const res = createMockResponse();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('Debe cambiar la contraseña, incrementar token_version, limpiar must_change_password, auditar y enviar correo', async () => {
      const passwordHash = await bcrypt.hash('PasswordVieja1', 4);
      const mockUser: any = {
        id: 5,
        username: 'piloto5',
        email: 'piloto5@test.com',
        user_type: 'user',
        password: passwordHash,
        token_version: 2,
        must_change_password: true,
        compare_password: (p: string) => bcrypt.compare(p, passwordHash),
      };
      mockFindOne.mockResolvedValue(mockUser);

      const req = {
        user: { id: 5, username: 'piloto5', user_type: 'user' },
        body: {
          currentPassword: 'PasswordVieja1',
          newPassword: 'PasswordNueva2',
        },
        headers: { 'x-forwarded-for': '203.0.113.10' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionsInvalidated: true,
          emailNotified: true,
        }),
      );
      expect(await bcrypt.compare('PasswordNueva2', mockUser.password)).toBe(
        true,
      );
      expect(mockUser.token_version).toBe(3);
      expect(mockUser.must_change_password).toBe(false);
      expect(mockUser.password_changed_at).toBeInstanceOf(Date);
      expect(mockFlush).toHaveBeenCalledTimes(1);
      expect(mockPersistAndFlush).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'PASSWORD_CHANGED',
          target_user_id: 5,
          actor_user_id: 5,
          ip_address: '203.0.113.10',
        }),
      );
      expect(mockSendPasswordChangedEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'piloto5@test.com',
          username: 'piloto5',
          ipAddress: '203.0.113.10',
        }),
      );
    });
  });

  describe('adminResetPassword', () => {
    it('Debe impedir que un admin ejecute reseteo administrativo sobre su propia cuenta', async () => {
      const req = {
        params: { id: '1' },
        user: { id: 1, username: 'admin1', user_type: 'admin' },
        body: {},
        headers: {},
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminResetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'SELF_ADMIN_RESET_NOT_ALLOWED' }),
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('Debe resetear contraseña, forzar cambio en próximo ingreso, invalidar sesiones, auditar y notificar', async () => {
      const mockTargetUser: any = {
        id: 22,
        username: 'user22',
        email: 'user22@test.com',
        user_type: 'user',
        password: 'old_hashed_password',
        token_version: 4,
        must_change_password: false,
      };
      mockFindOneOrFail.mockResolvedValue(mockTargetUser);

      const req = {
        params: { id: '22' },
        user: { id: 1, username: 'admin1', user_type: 'admin' },
        body: { reason: 'Cuenta comprometida reportada por soporte' },
        headers: { 'x-forwarded-for': '198.51.100.7' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminResetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 22,
            must_change_password: true,
            sessionsInvalidated: true,
            emailNotified: true,
          }),
        }),
      );
      expect(mockTargetUser.must_change_password).toBe(true);
      expect(mockTargetUser.token_version).toBe(5);
      expect(mockTargetUser.password_changed_at).toBeInstanceOf(Date);
      expect(mockTargetUser.password).not.toBe('old_hashed_password');
      expect(mockFlush).toHaveBeenCalledTimes(1);
      expect(mockPersistAndFlush).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'ADMIN_PASSWORD_RESET',
          target_user_id: 22,
          actor_user_id: 1,
          ip_address: '198.51.100.7',
        }),
      );
      expect(mockSendAdminPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user22@test.com',
          username: 'user22',
          reason: 'Cuenta comprometida reportada por soporte',
        }),
      );
    });
  });
});
