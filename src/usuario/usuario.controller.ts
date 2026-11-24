import { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from '../shared/upload/upload.utils.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { recordSecurityEvent } from '../auth/security-audit.service.js';
import { sendAdminPasswordResetEmail } from '../services/email/email.service.js';

function sanitizeUsuario(req: Request, res: Response, next: NextFunction) {
  if (
    req.body?.password !== undefined &&
    String(req.body.password).length > 0
  ) {
    return res.status(400).json({
      message:
        'No se permite cambiar la contraseña desde la actualización de perfil. Utilizá el endpoint dedicado POST /api/auth/change-password.',
      error: 'PASSWORD_CHANGE_NOT_ALLOWED',
    });
  }

  const sanitized: Record<string, any> = {};

  if (req.body.username !== undefined)
    sanitized.username = req.body.username.trim();
  if (req.body.name !== undefined) sanitized.name = req.body.name.trim();
  if (req.body.surname !== undefined)
    sanitized.surname = req.body.surname.trim() || null;
  if (req.body.email !== undefined) sanitized.email = req.body.email.trim();

  if (req.body.date_of_birth !== undefined) {
    if (
      req.body.date_of_birth &&
      String(req.body.date_of_birth).trim() !== ''
    ) {
      const d = new Date(req.body.date_of_birth);
      sanitized.date_of_birth = isNaN(d.getTime()) ? null : d;
    } else {
      sanitized.date_of_birth = null;
    }
  }

  if (req.body.fav_driver !== undefined)
    sanitized.fav_driver = req.body.fav_driver.trim() || null;
  if (req.body.fav_team !== undefined)
    sanitized.fav_team = req.body.fav_team.trim() || null;
  if (req.body.fav_circuit !== undefined)
    sanitized.fav_circuit = req.body.fav_circuit.trim() || null;
  if (req.body.bio !== undefined) sanitized.bio = req.body.bio.trim() || null;

  if (req.body.telegram_username !== undefined) {
    let crudo = req.body.telegram_username;
    //Si es null o vacío queda en null
    if (crudo === null || crudo === '') {
      sanitized.telegram_username = null;

      //Como validamos con código otp, en verdad acá podriamos dejar pasar cualquier cosa, pero por las dudas
      //rechazamos los espacios, los strings muy cortos y todo lo que no sea string
      //(El front stringifica siempre, por si algun usuario llega a ser 12345).
    } else if (typeof crudo === 'string') {
      crudo = crudo.trim();
      crudo = crudo.startsWith('@') ? crudo.slice(1) : crudo;
      if (crudo.length < 5 || crudo.includes(' ')) {
        return res.status(400).json({
          message:
            'El usuario de Telegram no debe contener espacios y debe tener al menos 5 caracteres.',
        });
      }
      sanitized.telegram_username = crudo;
    } else {
      return res.status(400).json({
        message: 'El usuario de Telegram debe ser texto.',
      });
    }
  }

  if (req.body.user_type !== undefined)
    sanitized.user_type = req.body.user_type;

  if (req.file) {
    sanitized.avatar = getRelativePath(req.file.path);
  }

  req.body.sanitizedInput = sanitized;
  next();
}

export interface UsuarioResponseDTO {
  id?: number;
  username: string;
  name: string;
  surname: string | null;
  email: string;
  user_type: string;
  date_of_birth: Date | null;
  fav_driver: string | null;
  fav_team: string | null;
  fav_circuit: string | null;
  bio: string | null;
  avatar: string | null;
  avatar_url?: string | null;
  telegram_username: string | null;
  must_change_password: boolean;
}

export interface UsuarioPublicDTO {
  id?: number;
  username: string;
  name: string;
  avatar_url?: string | null;
  is_admin: boolean;
}

function toUsuarioDTO(req: Request, usuario: Usuario): UsuarioResponseDTO {
  return {
    id: usuario.id,
    username: usuario.username,
    name: usuario.name,
    surname: usuario.surname ?? null,
    email: usuario.email,
    user_type: usuario.user_type,
    date_of_birth: usuario.date_of_birth ?? null,
    fav_driver: usuario.fav_driver ?? null,
    fav_team: usuario.fav_team ?? null,
    fav_circuit: usuario.fav_circuit ?? null,
    bio: usuario.bio ?? null,
    avatar: usuario.avatar ?? null,
    avatar_url: usuario.avatar ? buildImageUrl(req, usuario.avatar) : undefined,
    telegram_username: usuario.telegram_username ?? null,
    must_change_password: Boolean(usuario.must_change_password),
  };
}

function toUsuarioPublicDTO(req: Request, usuario: Usuario): UsuarioPublicDTO {
  return {
    id: usuario.id,
    username: usuario.username,
    name: usuario.name,
    avatar_url: usuario.avatar ? buildImageUrl(req, usuario.avatar) : undefined,
    is_admin: usuario.user_type?.toLowerCase() === 'admin',
  };
}

async function uploadAvatar(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Subir avatar de usuario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['avatar'] = { in: 'formData', type: 'file', required: true, description: 'Imagen de avatar' }
    #swagger.responses[200] = { 
      description: 'Avatar uploaded',
      schema: { message: { type: 'string', example: 'Avatar uploaded' }, data: { $ref: '#/components/schemas/Usuario' } }
    }
    #swagger.responses[400] = { 
      description: 'Bad Request',
      schema: { message: { type: 'string', example: 'Image is required' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
    }

    usuario.avatar = getRelativePath(req.file.path);
    await em.flush();

    res
      .status(200)
      .json({ message: 'Avatar uploaded', data: toUsuarioDTO(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deleteAvatar(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Eliminar avatar de usuario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Avatar deleted',       
      schema: { 
        message: { type: 'string', example: 'Avatar deleted' }, 
        data: { $ref: '#/components/schemas/Usuario' } 
      }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
      usuario.avatar = undefined;
      await em.flush();
    }

    res
      .status(200)
      .json({ message: 'Avatar deleted', data: toUsuarioDTO(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// obtener todos los usuarios
async function findAll(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener todos los usuarios'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' },
        data: [{ $ref: '#/components/schemas/Usuario' }] 
      }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const usuarios = await em.find(Usuario, {});
    const usuariosDTO = usuarios.map((u) => toUsuarioDTO(req, u));
    res.status(200).json({ message: 'OK', data: usuariosDTO });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Obtener un usuario por ID

async function findOne(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener un usuario por ID'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' },
        data: { $ref: '#/components/schemas/Usuario' } 
      }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });
    res.status(200).json({ message: 'OK', data: toUsuarioDTO(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Actualizar un usuario existente

async function update(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Actualizar perfil de un usuario (no permite cambiar contraseña)'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/UsuarioUpdateInput" }
    }
    #swagger.responses[200] = {
      description: 'Updated',
      schema: { 
        message: { type: 'string', example: 'Updated' },
        data: { $ref: '#/components/schemas/Usuario' } 
      }
    }
    #swagger.responses[400] = { description: 'Bad Request (ej. intento de cambiar contraseña desde update de perfil)' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[409] = { 
      description: 'Conflict',
      schema: { message: { type: 'string', example: 'El correo provisto ya está registrado.' } }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (req.file) {
      if (usuario.avatar) {
        deleteFile(usuario.avatar);
      }
      req.body.sanitizedInput.avatar = getRelativePath(req.file.path);
    }

    const { email, username, telegram_username } = req.body.sanitizedInput;

    if (email) {
      const existeEmail = await em.findOne(Usuario, { email, id: { $ne: id } });
      if (existeEmail) {
        return res
          .status(409)
          .json({ message: 'El correo provisto ya está registrado.' });
      }
    }

    if (username) {
      const existeUsername = await em.findOne(Usuario, {
        username,
        id: { $ne: id },
      });
      if (existeUsername) {
        return res
          .status(409)
          .json({ message: 'El nombre de usuario ya está en uso.' });
      }
    }

    if (telegram_username && telegram_username.length > 0) {
      const existeTelegram = await em.findOne(Usuario, {
        telegram_username,
        id: { $ne: id },
      });
      if (existeTelegram) {
        return res.status(409).json({
          message: 'El usuario de telegram está registrado en otra cuenta.',
        });
      }

      // Si cambió el telegram_username, regenerar el código OTP para que vuelva a vincular
      if (telegram_username !== usuario.telegram_username) {
        req.body.sanitizedInput.telegram_id =
          'otp' +
          Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
      }
    } else if (telegram_username !== undefined) {
      // Si borró el telegram_username, limpiar también el telegram_id
      req.body.sanitizedInput.telegram_id = null;
    }

    delete req.body.sanitizedInput.id;
    delete req.body.sanitizedInput.password;
    delete req.body.sanitizedInput.token_version;
    delete req.body.sanitizedInput.must_change_password;
    delete req.body.sanitizedInput.password_changed_at;
    delete req.body.sanitizedInput.reset_password_token;
    delete req.body.sanitizedInput.reset_password_expires;

    em.assign(usuario, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Updated', data: toUsuarioDTO(req, usuario) });
  } catch (error: any) {
    console.error('Error in update usuario:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Eliminar un usuario

async function remove(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Eliminar un usuario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[204] = { description: 'Deleted' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
    }

    await em.removeAndFlush(usuario);
    res.status(204).json({ message: 'Deleted' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
// Encontrar usuarios publicos

async function findPublic(req: Request, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener usuarios publicos'
    #swagger.responses[200] = {
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' },
        data: [{ 
          id: { type: 'integer' },
          username: { type: 'string' },
          name: { type: 'string' },
          avatar_url: { type: 'string' },
          is_admin: { type: 'boolean' }
        }] 
      }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const usuarios = await em.find(Usuario, {});
    const data = usuarios.map((u) => toUsuarioPublicDTO(req, u));
    res.status(200).json({ message: 'OK', data });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function adminResetPassword(req: AuthenticatedRequest, res: Response) {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Reseteo administrativo de contraseña (auditado, invalida sesiones y fuerza cambio en próximo ingreso)'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: false,
      schema: {
        temporaryPassword: { type: 'string', example: 'TempPass123!' },
        reason: { type: 'string', example: 'Solicitud de soporte por cuenta bloqueada' }
      }
    }
    #swagger.responses[200] = {
      description: 'Contraseña restablecida administrativamente',
      schema: {
        message: { type: 'string' },
        data: {
          userId: { type: 'integer' },
          must_change_password: { type: 'boolean', example: true },
          sessionsInvalidated: { type: 'boolean', example: true },
          emailNotified: { type: 'boolean', example: true }
        }
      }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[403] = { description: 'Solo administradores' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const em = orm.em.fork();
  try {
    const id = Number.parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    if (req.user?.id === id) {
      return res.status(400).json({
        message:
          'No podés usar el reseteo administrativo sobre tu propia cuenta. Utilizá POST /api/auth/change-password.',
        error: 'SELF_ADMIN_RESET_NOT_ALLOWED',
      });
    }

    const { temporaryPassword, reason } = req.body ?? {};

    let tempPassword: string;
    if (temporaryPassword !== undefined) {
      if (
        typeof temporaryPassword !== 'string' ||
        temporaryPassword.length < 8
      ) {
        return res.status(400).json({
          message:
            'La contraseña temporal provista debe tener al menos 8 caracteres.',
        });
      }
      tempPassword = temporaryPassword;
    } else {
      tempPassword = crypto.randomBytes(12).toString('base64url');
    }

    const sanitizedReason =
      typeof reason === 'string' && reason.trim().length > 0
        ? reason.trim().slice(0, 255)
        : undefined;

    const usuario = await em.findOneOrFail(Usuario, { id });
    const resetAt = new Date();

    usuario.password = await bcrypt.hash(tempPassword, 12);
    usuario.must_change_password = true;
    usuario.token_version = (usuario.token_version ?? 0) + 1;
    usuario.password_changed_at = resetAt;
    usuario.reset_password_token = undefined;
    usuario.reset_password_expires = undefined;

    await em.flush();

    const adminActorLabel = req.user?.username
      ? `${req.user.username} (ID ${req.user.id})`
      : `ID ${req.user?.id}`;

    await recordSecurityEvent({
      eventType: 'ADMIN_PASSWORD_RESET',
      targetUserId: usuario.id!,
      actorUserId: req.user?.id,
      req,
      details: sanitizedReason
        ? `Reseteo administrativo ejecutado por ${adminActorLabel}. Motivo: ${sanitizedReason}`
        : `Reseteo administrativo ejecutado por ${adminActorLabel}.`,
    });

    let emailNotified = true;
    try {
      await sendAdminPasswordResetEmail({
        to: usuario.email,
        username: usuario.username,
        temporaryPassword: tempPassword,
        reason: sanitizedReason,
        resetAt,
      });
    } catch (mailError) {
      emailNotified = false;
      console.error(
        'Error al enviar correo de reseteo administrativo:',
        mailError,
      );
    }

    return res.status(200).json({
      message:
        'Contraseña restablecida administrativamente. El usuario deberá cambiarla en su próximo ingreso y sus sesiones previas fueron invalidadas.',
      data: {
        userId: usuario.id,
        must_change_password: true,
        sessionsInvalidated: true,
        emailNotified,
      },
    });
  } catch (error: any) {
    console.error('Error in adminResetPassword:', error);
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export {
  sanitizeUsuario,
  toUsuarioDTO,
  toUsuarioPublicDTO,
  findAll,
  findOne,
  update,
  remove,
  uploadAvatar,
  deleteAvatar,
  findPublic,
  adminResetPassword,
};
