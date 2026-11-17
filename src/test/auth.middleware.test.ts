import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import {
  authenticateAdmin,
  authenticateToken,
  authorizeSelfOrAdmin,
  getTokenVersion,
} from '../auth/auth.middleware.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

const { mockFindOne } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
}));

vi.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      fork: () => ({
        findOne: mockFindOne,
      }),
    },
  },
}));

describe('Auth Middleware Tests', () => {
  const JWT_SECRET = 'clave_secreta_para_test';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    mockFindOne.mockReset();
  });

  const crearMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  describe('authenticateToken', () => {
    it('Debe responder 401 NO_TOKEN si no se envia la cabecera Authorization', async () => {
      const req = {
        headers: {},
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
      expect(mockFindOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe responder 401 INVALID_TOKEN si la firma del token no es válida', async () => {
      const tokenInvalido = jwt.sign({ id: 1 }, 'otra_clave');
      const req = {
        headers: {
          authorization: `Bearer ${tokenInvalido}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'INVALID_TOKEN',
        }),
      );
      expect(mockFindOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() y adjuntar el usuario actual de la BD en req.user si el token y la cuenta son válidos', async () => {
      const dbUser = {
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword123',
        avatar: 'avatars/foto.png',
      };
      mockFindOne.mockResolvedValueOnce(dbUser);

      const tokenValido = jwt.sign(
        {
          id: dbUser.id,
          username: dbUser.username,
          user_type: dbUser.user_type,
          token_v: getTokenVersion(dbUser),
        },
        JWT_SECRET,
      );

      const req = {
        headers: {
          authorization: `Bearer ${tokenValido}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toEqual({
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
        email: 'test@example.com',
        avatar: 'avatars/foto.png',
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('Debe responder 401 USER_NOT_FOUND si la cuenta fue eliminada de la BD', async () => {
      mockFindOne.mockResolvedValueOnce(null);

      const tokenValido = jwt.sign(
        {
          id: 99,
          username: 'borrado',
          user_type: 'user',
        },
        JWT_SECRET,
      );

      const req = {
        headers: {
          authorization: `Bearer ${tokenValido}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'USER_NOT_FOUND',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe responder 401 TOKEN_REVOKED si el rol (user_type) cambió en la BD', async () => {
      const dbUserDegradado = {
        id: 2,
        username: 'ex_admin',
        user_type: 'user',
        email: 'exadmin@example.com',
        password: '$2b$12$hashedpassword123',
      };
      mockFindOne.mockResolvedValueOnce(dbUserDegradado);

      const tokenViejoAdmin = jwt.sign(
        {
          id: 2,
          username: 'ex_admin',
          user_type: 'admin',
          token_v: getTokenVersion({
            password: dbUserDegradado.password,
            user_type: 'admin',
          }),
        },
        JWT_SECRET,
      );

      const req = {
        headers: {
          authorization: `Bearer ${tokenViejoAdmin}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'TOKEN_REVOKED',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe responder 401 TOKEN_REVOKED si la contraseña cambió en la BD', async () => {
      const oldPasswordHash = '$2b$12$oldHashValue';
      const newPasswordHash = '$2b$12$newHashValueAfterReset';

      mockFindOne.mockResolvedValueOnce({
        id: 3,
        username: 'user_clave',
        user_type: 'user',
        email: 'clave@example.com',
        password: newPasswordHash,
      });

      const tokenPreCambio = jwt.sign(
        {
          id: 3,
          username: 'user_clave',
          user_type: 'user',
          token_v: getTokenVersion({
            password: oldPasswordHash,
            user_type: 'user',
          }),
        },
        JWT_SECRET,
      );

      const req = {
        headers: {
          authorization: `Bearer ${tokenPreCambio}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'TOKEN_REVOKED',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('authorizeSelfOrAdmin debe responder 403 ACCESS_NOT_GRANTED si un usuario no-admin intenta editar otro perfil', async () => {
      const dbUser = {
        id: 5,
        username: 'normal_user',
        user_type: 'user',
        email: 'user@example.com',
        password: '$2b$12$hashedpassword123',
      };
      mockFindOne.mockResolvedValueOnce(dbUser);

      const token = jwt.sign(
        {
          id: dbUser.id,
          username: dbUser.username,
          user_type: dbUser.user_type,
          token_v: getTokenVersion(dbUser),
        },
        JWT_SECRET,
      );

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: { id: '99' },
        body: {},
      } as unknown as AuthenticatedRequest;

      const res = crearMockResponse();
      const next = vi.fn() as NextFunction;

      await authorizeSelfOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'ACCESS_NOT_GRANTED',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
