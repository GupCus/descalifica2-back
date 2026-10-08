import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { authenticateToken } from '../auth/auth.middleware';
import { AuthenticatedRequest } from '../auth/auth.types';

describe('Auth Middleware Tests', () => {
  const JWT_SECRET = 'clave_secreta_para_test';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  //funcion para simular el objeto 'res' de express
  const crearMockRespnse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  describe('authencateToken', () => {
    it('Debe responder 401 NO_TOKEN si no se envia la cabecera Authorization', () => {
      const req = {
        headers: {}, // Sin cabecera Authorization
      } as AuthenticatedRequest;

      const res = crearMockRespnse();
      const next = vi.fn() as NextFunction;

      // ejecutamos la funcion que vamos a probar
      authenticateToken(req, res, next);

      // verificamos que se haya llamado a res.status con 401
      expect(res.status).toHaveBeenCalledWith(401);
      // verificamos que se haya llamado a res.json con el mensaje de error esperado
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'NO_TOKEN',
        }),
      );
      // verificamos que next no haya sido llamado
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() y adjuntar el usuario en req.user si el token es válido', () => {
      //Creamos un usuario de prueba y firmamos un token real
      const usuarioPrueba = {
        id: 1,
        username: 'usuario_test',
        user_type: 'cliente',
      };
      const tokenValido = jwt.sign(usuarioPrueba, JWT_SECRET);

      // Simulamos la cabecera Authorization con el token válido
      const req = {
        headers: {
          authorization: `Bearer ${tokenValido}`,
        },
      } as AuthenticatedRequest;

      const res = crearMockRespnse();
      const next = vi.fn() as NextFunction;

      // ejecutamos la funcion que vamos a probar
      authenticateToken(req, res, next);

      // verificamos que next haya sido llamado
      expect(next).toHaveBeenCalledTimes(1);
      //verificamos que req.user contenga la informacion del usuario decodificado
      expect(req.user).toMatchObject({
        id: 1,
        username: 'usuario_test',
      });
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
