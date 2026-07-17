import { AuthenticatedRequest, jwtpayload } from "./auth.types.js";
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
      }
    );
  } catch (error) {
    console.error(
      "Error en auth middleware: ",
      res.status(500).json({
        message: "Internal server error",
      })
    );
  }
};

//middleware administradores
export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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
