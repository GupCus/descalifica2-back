import { AuthenticatedRequest, jwtpayload } from './auth.types.js';
import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';

export const DEFAULT_REAUTH_WINDOW_SECONDS = 5 * 60; // 5 minutos

interface AuthenticateOptions {
  allowMustChangePassword?: boolean;
}

const createAuthenticateToken = (options: AuthenticateOptions = {}) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authHeader = req.headers.authorization as string | undefined;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          message: 'Token requerido.',
          error: 'NO_TOKEN',
        });
      }

      let decoded: jwtpayload;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string,
        ) as jwtpayload;
      } catch (err: any) {
        if (err?.name === 'TokenExpiredError') {
          return res.status(403).json({
            message: 'Token expirado :(',
            error: 'TOKEN_EXPIRED',
          });
        }

        return res.status(403).json({
          message: 'Invalid token.',
          error: 'INVALID_TOKEN',
        });
      }

      const em = orm.em.fork();
      const usuario = await em.findOne(Usuario, { id: decoded.id });

      if (!usuario) {
        return res.status(401).json({
          message: 'Usuario no encontrado o sesión inválida.',
          error: 'SESSION_INVALIDATED',
        });
      }

      const currentTokenVersion = usuario.token_version ?? 0;
      const payloadTokenVersion = decoded.token_version ?? 0;

      if (payloadTokenVersion !== currentTokenVersion) {
        return res.status(401).json({
          message: 'Sesión invalidada. Por favor, iniciá sesión nuevamente.',
          error: 'SESSION_INVALIDATED',
        });
      }

      if (
        usuario.password_changed_at &&
        decoded.iat !== undefined &&
        decoded.iat < Math.floor(usuario.password_changed_at.getTime() / 1000)
      ) {
        return res.status(401).json({
          message:
            'Sesión invalidada por cambio de contraseña. Por favor, iniciá sesión nuevamente.',
          error: 'SESSION_INVALIDATED',
        });
      }

      if (!options.allowMustChangePassword && usuario.must_change_password) {
        return res.status(403).json({
          message: 'Debes cambiar tu contraseña antes de continuar.',
          error: 'PASSWORD_CHANGE_REQUIRED',
        });
      }

      req.user = {
        ...decoded,
        id: usuario.id!,
        username: usuario.username,
        user_type: usuario.user_type,
        email: usuario.email,
        token_version: currentTokenVersion,
        must_change_password: Boolean(usuario.must_change_password),
        auth_time: decoded.auth_time ?? decoded.iat,
      };

      return next();
    } catch (error) {
      console.error('Error en auth middleware:', error);
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
};

export const authenticateToken = createAuthenticateToken({
  allowMustChangePassword: false,
});

export const authenticateTokenAllowPasswordChange = createAuthenticateToken({
  allowMustChangePassword: true,
});

export const requireRecentAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const configuredWindow = Number(process.env.REAUTH_WINDOW_SECONDS);
  const windowSeconds =
    Number.isFinite(configuredWindow) && configuredWindow > 0
      ? configuredWindow
      : DEFAULT_REAUTH_WINDOW_SECONDS;

  const authTime = req.user?.auth_time ?? req.user?.iat;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!authTime || nowSeconds - authTime > windowSeconds) {
    return res.status(401).json({
      message:
        'Se requiere una reautenticación reciente para cambiar la contraseña.',
      error: 'REAUTH_REQUIRED',
    });
  }

  return next();
};

//middleware administradores
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  await authenticateToken(req, res, () => {
    if (req.user?.user_type === 'admin') {
      return next();
    }
    return res.status(403).json({
      message: 'Sólo administradores.',
      error: 'ACCESS_NOT_GRANTED',
    });
  });
};

//middleware clientes
export const authenticateCliente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  await authenticateToken(req, res, () => {
    if (req.user?.user_type === 'cliente') {
      return next();
    }
    return res.status(403).json({
      message: 'Acceso para clientes.',
      error: 'ACCESS_NOT_GRANTED',
    });
  });
};

export const authorizeSelfOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  await authenticateToken(req, res, () => {
    const targetId = Number.parseInt(req.params.id);
    const isAdmin = req.user?.user_type === 'admin';
    const isSelf = req.user?.id != null && req.user.id === targetId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        message: 'Solo podés editar tu propio perfil.',
        error: 'ACCESS_NOT_GRANTED',
      });
    }

    if (!isAdmin && req.body?.user_type !== undefined) {
      delete req.body.user_type;
    }

    return next();
  });
};

export function sanitizeLogin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.googlePayload) {
    return next();
  }

  // Si es un login normal, sanitizamos el body
  req.body.sanitizedInput = {
    mail: req.body.mail,
    password: req.body.password,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export function sanitizeRegister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sanitizedInput = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    date_of_birth: req.body.date_of_birth,
    name: req.body.name,
    surname: req.body.surname,
    telegram_username: req.body.telegram_username,
    telegram_code: req.body.telegram_code,
    fav_driver: req.body.fav_driver,
    fav_team: req.body.fav_team,
    fav_circuit: req.body.fav_circuit,
    bio: req.body.bio,
    avatar_url: req.body.avatar_url || req.body.avatar,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}
