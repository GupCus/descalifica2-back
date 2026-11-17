import { Request, Response, NextFunction } from 'express';
import { sanitizeUsuario } from '../usuario/usuario.controller';

// Me intentaba concectar a la BD, tuve que poner esto
//El resto es igual al test de auth que ya hicimos
//Chqueamos los casos del issue (null|""|"@usuario"|" @usu ario ")
vi.mock('../shared/db/orm.js', () => ({ orm: {} }));

describe('Test de user de telegram', () => {
  const crearMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  // arma req/res/next y ejecuta la funcion con el telegram_username dado
  const ejecutar = (telegram_username: unknown) => {
    const req = { body: { telegram_username } } as Request;
    const res = crearMockResponse();
    const next = vi.fn() as NextFunction;
    sanitizeUsuario(req, res, next);
    return { req, res, next };
  };

  it('Debe dejar en null si se envía null', () => {
    const { req, next } = ejecutar(null);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.sanitizedInput.telegram_username).toBeNull();
  });

  it('Debe dejar en null si se envía cadena vacía', () => {
    const { req, next } = ejecutar('');
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.sanitizedInput.telegram_username).toBeNull();
  });

  it('Debe quitar el @ si se envía "@usuario"', () => {
    const { req, next } = ejecutar('@usuario');
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.sanitizedInput.telegram_username).toBe('usuario');
  });

  it('Debe responder 400 si el usuario contiene espacios', () => {
    const { res, next } = ejecutar(' @usu ario ');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
