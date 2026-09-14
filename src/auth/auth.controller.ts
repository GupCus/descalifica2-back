import { orm } from '../shared/db/orm.js';
import {
  AuthenticatedRequest,
  LoginResponse,
  RegisterRequest,
} from './auth.types.js';
import { Request, Response } from 'express';
import { Usuario } from '../usuario/usuario.entity.js';
import jwt, { SignOptions } from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getRelativePath } from '../shared/upload/upload.utils.js';
import { sendPasswordResetEmail } from '../services/email/email.service.js';

async function register(req: Request, res: Response) {
  try {
    const secret = process.env.JWT_SECRET;
    const {
      username,
      email,
      password,
      date_of_birth,
      name,
      surname,
      telegram_username,
      fav_driver,
      fav_team,
      fav_circuit,
      bio,
      avatar_url,
    }: RegisterRequest = req.body.sanitizedInput;

    if (!username || !email || !password || !date_of_birth || !name) {
      return res.status(400).json({
        message: `Todos los campos son obligatorios.`,
      });
    }

    // validar que telegram_user no tenga espacios
    if (telegram_username) {
      if (/\s/.test(telegram_username.trim())) {
        return res.status(400).json({
          message: 'El username de Telegram no debe contener espacios.',
        });
      }
    }

    //verificar que el mail sea válido.
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Introduzca un mail válido.',
      });
    }

    //validación de longitud de contraseña y usuario
    if (password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña requiere al menos 6 caracteres.',
      });
    }

    if (username.length < 6) {
      return res.status(400).json({
        message: 'El nombre de usuario debe tener al menos 6 caracteres.',
      });
    }

    //validación de edad.
    const nacimiento = new Date(date_of_birth);

    if (isNaN(nacimiento.getTime())) {
      return res.status(400).json({
        message: 'Fecha de nacimiento mal escrita (AAAA/MM/DD).',
      });
    }
    const today = new Date();
    const minimunAge = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate(),
    );
    const maxAge = new Date(
      today.getFullYear() + 100,
      today.getMonth(),
      today.getDate(),
    );
    if (nacimiento > minimunAge) {
      return res.status(400).json({
        message:
          'Debes tener al menos 13 (trece) años para registrarte en este foro.',
      });
    } else if (today.getFullYear() - nacimiento.getFullYear() > 100) {
      return res.status(400).json({
        message:
          'Lamentablemente 100 años nos parecen un montón para que te registrés en el foro.',
      });
    }

    //verificar existencia del correo o usuario
    const em = orm.em.fork();
    const existeUsuarioMail = await em.findOne(Usuario, { email: email });
    if (existeUsuarioMail) {
      return res.status(409).json({
        message: 'El correo provisto ya está registrado.',
      });
    }

    const existeUsername = await em.findOne(Usuario, { username: username });
    if (existeUsername) {
      return res.status(409).json({
        message: 'El nombre de usuario ya está en uso.',
      });
    }

    if (
      telegram_username &&
      telegram_username.length > 0 &&
      (await em.findOne(Usuario, {
        telegram_username: telegram_username,
      }))
    ) {
      return res.status(409).json({
        message: 'El usuario de telegram está registrado en otra cuenta.',
      });
    }

    const usuario = em.create(Usuario, {
      email: email,
      username: username,
      password: password,
      date_of_birth: date_of_birth,
      user_type: 'user',
      name: name,
      surname: surname?.trim() || undefined,
      telegram_username: telegram_username?.trim() || undefined,
      fav_driver: fav_driver?.trim() || undefined,
      fav_team: fav_team?.trim() || undefined,
      fav_circuit: fav_circuit?.trim() || undefined,
      bio: bio?.trim() || undefined,
      avatar: req.file
        ? getRelativePath(req.file.path)
        : avatar_url?.trim() || undefined,
    });

    await em.persistAndFlush(usuario);

    if (!usuario || !usuario.id) {
      return res.status(500).json({
        message: 'Ocurrió un error al crear el usuario.',
      });
    }

    const payload = {
      id: usuario.id,
      mail: usuario.email,
      user_type: usuario.user_type,
      username: usuario.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.EXPIRA_TOKEN,
      } as SignOptions,
    );

    const response: LoginResponse = {
      token: token,
      user: {
        id: usuario.id,
        username: usuario.username,
        user_type: usuario.user_type,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      message: 'Error registrando al usuario',
    });
  }
}

async function checkToken(req: AuthenticatedRequest, res: Response) {
  try {
    // Obtener el usuario actual de la BD para verificar datos actualizados
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user?.id });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Devolver datos actualizados de la BD, no del token
    res.status(200).json({
      message: 'Token válido',
      user: {
        id: usuario.id,
        username: usuario.username,
        user_type: usuario.user_type, // Valor actual de la BD
        avatar: usuario.avatar ? usuario.avatar : null,
      },
    });
  } catch (error) {
    console.error(`checkToken error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const em = orm.em.fork();
    let mail: string;
    let password: string | undefined = undefined;

    //Si el inicio de sesión fué con google
    if (res.locals.googlePayload) {
      mail = res.locals.googlePayload.email!;
      //Flujo normal
    } else {
      mail = req.body.sanitizedInput.mail;
      password = req.body.sanitizedInput.password;

      if (!mail || !password) {
        return res.status(400).json({
          message: 'Por favor complete todos los campos.',
        });
      }
    }

    const usuario = await em.findOne(Usuario, { email: mail });

    if (!usuario || !usuario.id) {
      // Si es un login de Google, le devolvemos los datos para que el front lo registra
      if (res.locals.googlePayload) {
        return res.status(404).json({
          message: 'Usuario de gauth no registrado. Redirigir al registro...',
          action: 'REQUIERE_REGISTRO',
          prefillData: {
            email: res.locals.googlePayload.email,
            name: res.locals.googlePayload.given_name,
            surname: res.locals.googlePayload.family_name,
            avatar: res.locals.googlePayload.picture,
          },
        });
      }
      return res.status(401).json({
        message: 'El usuario no existe.',
      });
    }

    if (password && !(await usuario.compare_password(password))) {
      return res.status(401).json({
        message: 'Contraseña incorrecta.',
      });
    }

    if (
      res.locals.googlePayload?.picture &&
      (!usuario.avatar || usuario.avatar.startsWith('/uploads/'))
    ) {
      usuario.avatar = res.locals.googlePayload.picture;
      await em.flush();
    }
    const payload = {
      id: usuario.id,
      mail: usuario.email,
      user_type: usuario.user_type,
      username: usuario.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.EXPIRA_TOKEN,
      } as SignOptions,
    );

    const response: LoginResponse = {
      token: token,
      user: {
        id: usuario.id,
        username: usuario.username,
        user_type: usuario.user_type,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`ERROR LOGIN: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function forgotPassword(req: Request, res: Response) {
  try {
    const email = req.body.email?.trim();

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Por favor, proporciona un correo electrónico válido.',
      });
    }

    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { email });

    // Respuesta genérica para evitar enumeración de usuarios
    const genericResponse = {
      message:
        'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
    };

    if (!usuario) {
      return res.status(200).json(genericResponse);
    }

    // Generar token seguro y hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Expiración: 15 minutos
    usuario.reset_password_token = hashedToken;
    usuario.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000);

    await em.flush();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: usuario.email,
        resetUrl,
      });
    } catch (mailError) {
      console.error('Error al enviar correo de recuperación:', mailError);
      return res.status(500).json({
        message: 'Error al enviar el correo de recuperación. Inténtalo más tarde.',
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        message: 'Token de recuperación no proporcionado o inválido.',
      });
    }

    if (
      !newPassword ||
      typeof newPassword !== 'string' ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, {
      reset_password_token: hashedToken,
      reset_password_expires: { $gt: new Date() },
    });

    if (!usuario) {
      return res.status(400).json({
        message: 'El enlace de recuperación es inválido o ha expirado.',
      });
    }

    // Hashear y actualizar contraseña
    const salt = 12;
    usuario.password = await bcrypt.hash(newPassword, salt);

    // Invalidar token
    usuario.reset_password_token = undefined;
    usuario.reset_password_expires = undefined;

    await em.flush();

    return res.status(200).json({
      message:
        '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export { login, register, checkToken, forgotPassword, resetPassword };

