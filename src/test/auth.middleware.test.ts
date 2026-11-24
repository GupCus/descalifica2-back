import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';

const mockFindOne = vi.fn();

vi.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      fork: () => ({
        findOne: mockFindOne,
      }),
    },
  },
}));

const {
  authenticateToken,
  authenticateTokenAllowPasswordChange,
  requireRecentAuth,
} = await import('../auth/auth.middleware.js');

describe('Auth Middleware Tests', () => {
  const JWT_SECRET = 'clave_secreta_para_test';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    delete process.env.REAUTH_WINDOW_SECONDS;
    mockFindOne.mockReset();
  });

  //funcion para simular el objeto 'res' de express
  const crearMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  describe('authenticateToken', () => {
    it('Debe responder 401 NO_TOKEN si no se envia la cabecera Authorization', async () => {
      const req = {
        headers: {}, // Sin cabecera Authorization
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'NO_TOKEN',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() y adjuntar el usuario en req.user si el token es válido', async () => {
      mockFindOne.mockResolvedValue({
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
        email: 'test@example.com',
        token_version: 0,
        must_change_password: false,
      });

      const usuarioPrueba = {
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
        token_version: 0,
      };
      const tokenValido = jwt.sign(usuarioPrueba, JWT_SECRET);

      const req = {
        headers: {
          authorization: `Bearer ${tokenValido}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toMatchObject({
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('Debe responder 401 SESSION_INVALIDATED si el token_version del usuario cambió', async () => {
      mockFindOne.mockResolvedValue({
        id: 1,
        username: 'usuario_test',
        user_type: 'user',
        email: 'test@example.com',
        token_version: 2,
        must_change_password: false,
      });

      const tokenViejo = jwt.sign(
        { id: 1, username: 'usuario_test', user_type: 'user', token_version: 1 },
        JWT_SECRET,
      );

      const req = {
        headers: { authorization: `Bearer ${tokenViejo}` },
      } as AuthenticatedRequest;
      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'SESSION_INVALIDATED' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe bloquear acceso con 403 PASSWORD_CHANGE_REQUIRED si must_change_password es true', async () => {
      mockFindOne.mockResolvedValue({
        id: 1,
        username: 'usuario_test',
        user_type: 'user',
        email: 'test@example.com',
        token_version: 1,
        must_change_password: true,
      });

      const tokenValido = jwt.sign(
        { id: 1, username: 'usuario_test', user_type: 'user', token_version: 1 },
        JWT_SECRET,
      );

      const req = {
        headers: { authorization: `Bearer ${tokenValido}` },
      } as AuthenticatedRequest;
      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'PASSWORD_CHANGE_REQUIRED' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('authenticateTokenAllowPasswordChange debe permitir el acceso cuando must_change_password es true', async () => {
      mockFindOne.mockResolvedValue({
        id: 1,
        username: 'usuario_test',
        user_type: 'user',
        email: 'test@example.com',
        token_version: 1,
        must_change_password: true,
      });

      const tokenValido = jwt.sign(
        { id: 1, username: 'usuario_test', user_type: 'user', token_version: 1 },
        JWT_SECRET,
      );

      const req = {
        headers: { authorization: `Bearer ${tokenValido}` },
      } as AuthenticatedRequest;
      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateTokenAllowPasswordChange(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user?.must_change_password).toBe(true);
    });
  });

  describe('requireRecentAuth', () => {
    it('Debe responder 401 REAUTH_REQUIRED si la autenticación no es reciente', () => {
      const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
      const req = {
        user: {
          id: 1,
          username: 'usuario_test',
          user_type: 'user',
          auth_time: tenMinutesAgo,
        },
      } as AuthenticatedRequest;
      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      requireRecentAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'REAUTH_REQUIRED' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() si auth_time está dentro de la ventana permitida', () => {
      const now = Math.floor(Date.now() / 1000);
      const req = {
        user: {
          id: 1,
          username: 'usuario_test',
          user_type: 'user',
          auth_time: now - 30,
        },
      } as AuthenticatedRequest;
      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      requireRecentAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
