import { AuthenticatedRequest, jwtpayload } from "./auth.types.js";
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization as string;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token requerido.",
        error: "NO_TOKEN",
      });
    }

    jwt.verify(
      token as string,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(403).json({
              message: "Token expirado :(",
              error: "TOKEN_EXPIRED",
            });
          }

          return res.status(403).json({
            message: "Invalid token.",
            error: "INVALID_TOKEN",
          });
        }

        req.user = decoded as jwtpayload;
        next();
      },
    );
  } catch (error) {
    console.error(
      "Error en auth middleware: ",
      res.status(500).json({
        message: "Internal server error",
      }),
    );
  }
};

//middleware administradores
export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  authenticateToken(req, res, () => {
    if (req.user?.user_type === "admin") {
      return next();
    }
    return res.status(403).json({
      message: "Sólo administradores.",
      error: "ACCESS_NOT_GRANTED",
    });
  });
};

//middleware clientes
export const authenticateCliente = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  authenticateToken(req, res, () => {
    if (req.user?.user_type === "cliente") {
      return next();
    }
    return res.status(403).json({
      message: "Acceso para clientes.",
      error: "ACCESS_NOT_GRANTED",
    });
  });
};

export const authorizeSelfOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  authenticateToken(req, res, () => {
    const targetId = Number.parseInt(req.params.id);
    const isAdmin = req.user?.user_type === "admin";
    const isSelf = req.user?.id != null && req.user.id === targetId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        message: "Solo podés editar tu propio perfil.",
        error: "ACCESS_NOT_GRANTED",
      });
    }

    if (!isAdmin && req.body?.user_type !== undefined) {
      delete req.body.user_type;
    }

    next();
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
    fav_driver: req.body.fav_driver,
    fav_team: req.body.fav_team,
    fav_circuit: req.body.fav_circuit,
    bio: req.body.bio,
    avatar_url: req.body.avatar_url,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}
