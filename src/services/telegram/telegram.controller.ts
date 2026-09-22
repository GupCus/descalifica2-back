import { Request, Response } from 'express';
import { orm } from '../../shared/db/orm.js';
import { Usuario } from '../../usuario/usuario.entity.js';
import { AuthenticatedRequest } from '../../auth/auth.types.js';
import { pendingRegistrationLinks } from './telegram.service.js';

export const generarcodigo = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  /*
    #swagger.tags = ['Servicios: Telegram']
    #swagger.summary = 'Generar código de vinculación para usuario autenticado'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Código generado',
      schema: { 
        message: { type: 'string', example: 'Se ha generado el codigo correctamente.' },
        codigo: { type: 'string', example: 'otp1234' }
      }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[409] = { 
      description: 'Usuario ya validado',
      schema: { message: { type: 'string', example: 'El usuario ya está validado' } }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    } else if (usuario.telegram_id) {
      if (usuario.telegram_id.includes('otp')) {
        return res.status(200).json({
          message: 'El usuario ya estaba pendiente de validación',
          codigo: usuario.telegram_id,
        });
      } else {
        return res.status(409).json({
          message: 'El usuario ya está validado',
        });
      }
    } else {
      const codigotemp =
        'otp' +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');

      usuario.telegram_id = codigotemp;
      await em.flush();

      return res.status(200).json({
        message: 'Se ha generado el codigo correctamente.',
        codigo: codigotemp,
      });
    }
  } catch (error: any) {
    console.error('Hubo un error:', error);
    return res
      .status(500)
      .json({ message: 'Error interno', error: error.message });
  }
};

export const verificarVinculacion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  /*
    #swagger.tags = ['Servicios: Telegram']
    #swagger.summary = 'Verificar si el usuario autenticado vinculó Telegram'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Estado de vinculación',
      schema: { 
        vinculado: { type: 'boolean', example: true },
        pendiente: { type: 'boolean', example: false },
        telegram_username: { type: 'string', example: 'usuario_telegram' }
      }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!usuario.telegram_id) {
      return res.status(200).json({ vinculado: false, pendiente: false });
    }

    if (usuario.telegram_id.includes('otp')) {
      return res.status(200).json({ vinculado: false, pendiente: true });
    }

    return res.status(200).json({
      vinculado: true,
      pendiente: false,
      telegram_username: usuario.telegram_username || null,
    });
  } catch (error: any) {
    console.error('Error verificando vinculación:', error);
    return res
      .status(500)
      .json({ message: 'Error interno', error: error.message });
  }
};

export const desvincularTelegram = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  /*
    #swagger.tags = ['Servicios: Telegram']
    #swagger.summary = 'Desvincular cuenta de Telegram del usuario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Telegram desvinculado',
      schema: { message: { type: 'string', example: 'Cuenta de Telegram desvinculada correctamente.' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.telegram_id = null as any;
    usuario.telegram_username = null as any;
    await em.flush();

    return res.status(200).json({
      message: 'Cuenta de Telegram desvinculada correctamente.',
    });
  } catch (error: any) {
    console.error('Error desvinculando Telegram:', error);
    return res
      .status(500)
      .json({ message: 'Error interno', error: error.message });
  }
};

export const generarcodigoRegistro = async (_req: Request, res: Response) => {
  /*
    #swagger.tags = ['Servicios: Telegram']
    #swagger.summary = 'Generar código para registro en Telegram'
    #swagger.responses[200] = { 
      description: 'Código generado',
      schema: { 
        message: { type: 'string', example: 'Código de registro generado con éxito' },
        codigo: { type: 'string', example: 'reg123456' }
      }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const now = Date.now();
    for (const [code, val] of pendingRegistrationLinks.entries()) {
      if (val.expiresAt < now) {
        pendingRegistrationLinks.delete(code);
      }
    }

    const codigo =
      'reg' + Math.floor(100000 + Math.random() * 900000).toString();

    pendingRegistrationLinks.set(codigo, {
      vinculado: false,
      expiresAt: now + 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Código de registro generado con éxito',
      codigo,
    });
  } catch (error: any) {
    console.error('Error generando código de registro:', error);
    return res
      .status(500)
      .json({ message: 'Error interno', error: error.message });
  }
};

export const verificarRegistro = async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Servicios: Telegram']
    #swagger.summary = 'Verificar código de registro en Telegram'
    #swagger.responses[200] = { 
      description: 'Estado del registro',
      schema: { 
        vinculado: { type: 'boolean', example: false },
        pendiente: { type: 'boolean', example: false },
        expirado: { type: 'boolean', example: true },
        telegram_username: { type: 'string', example: 'usuario_telegram' },
        error: { type: 'string', example: null }
      }
    }
    #swagger.responses[400] = { 
      description: 'Bad Request',
      schema: { message: { type: 'string', example: 'Código requerido' } }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const { codigo } = req.params;
    if (!codigo) {
      return res.status(400).json({ message: 'Código requerido' });
    }

    const pending = pendingRegistrationLinks.get(codigo);
    if (!pending || pending.expiresAt < Date.now()) {
      return res.status(200).json({
        vinculado: false,
        pendiente: false,
        expirado: true,
      });
    }

    return res.status(200).json({
      vinculado: pending.vinculado,
      pendiente: !pending.vinculado && !pending.error,
      telegram_username: pending.telegramUsername || null,
      error: pending.error || null,
    });
  } catch (error: any) {
    console.error('Error verificando registro de Telegram:', error);
    return res
      .status(500)
      .json({ message: 'Error interno', error: error.message });
  }
};
