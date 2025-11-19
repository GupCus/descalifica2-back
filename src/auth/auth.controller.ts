import { orm } from "../shared/db/orm.js";
import {
  AuthenticatedRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./auth.types.js";
import { Request, Response } from "express";
import { Usuario } from "../usuario/usuario.entity.js";
import jwt from "jsonwebtoken";

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { mail, password }: LoginRequest = req.body;

      if (!mail || !password) {
        return res.status(400).json({
          message: "Por favor complete todos los campos.",
        });
      }

      const em = orm.em.fork();
      const usuario = await em.findOne(Usuario, { email: mail });

      if (!usuario) {
        return res.status(401).json({
          message: "El usuario no existe.",
        });
      }

      const isPasswordCorrect = await usuario.compare_password(password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message: "Contraseña incorrecta.",
        });
      }

      if (!usuario.id) {
        return res.status(500).json({
          message: "Internal server error.",
        });
      }

      const payload = {
        id: usuario.id,
        mail: usuario.email,
        user_type: usuario.user_type,
      };

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({
          message: "Internal server error. (JWT no configurado).",
        });
      }

      const token = jwt.sign(
        payload,
        secret as any,
        { expiresIn: process.env.EXPIRA_TOKEN || "7d" } as any
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
      res.status(500).json({ message: "Internal server error (¯_(ツ)_/¯)" });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const {
        username,
        email,
        password,
        date_of_birth,
        name,
      }: RegisterRequest = req.body;

      if (!username || !email || !password || !date_of_birth || !name) {
        res.status(400).json({
          message: "Todos los campos son obligatorios.",
        });
      }

      //verificar que el mail sea válido.
      if (!isValidEmail(email)) {
        return res.status(400).json({
          message: "Introduzca un mail válido.",
        });
      }

      //validación de longitud de contraseña y usuario
      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña requiere al menos 6 caracteres.",
        });
      }

      if (username.length < 6) {
        return res.status(400).json({
          message: "El nombre de usuario debe tener al menos 6 caracteres.",
        });
      }

      //validación de edad.
      const nacimiento = new Date(date_of_birth);

      if (isNaN(nacimiento.getTime())) {
        return res.status(400).json({
          message: "Fecha de nacimiento mal escrita (AAAA/MM/DD).",
        });
      }
      const today = new Date();
      const minimunAge = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
      );
      if (nacimiento < minimunAge) {
        return res.status(400).json({
          message:
            "Debes tener al menos 13 (trece) años para registrarte en este foro.",
        });
      }

      //verificar existencia del correo o usuario
      const em = orm.em.fork();
      const existeUsuarioMail = await em.findOne(Usuario, { email: email });
      if (existeUsuarioMail) {
        return res.status(409).json({
          message: "El correo provisto ya está registrado.",
        });
      }

      const existeUsername = await em.findOne(Usuario, { username: username });
      if (existeUsername) {
        return res.status(409).json({
          message: "El nombre de usuario ya está en uso.",
        });
      }

      const newUser = em.create(Usuario, {
        email: email,
        username: username,
        password: password,
        date_of_birth: date_of_birth,
        user_type: "user",
        name: name,
      });

      await em.persistAndFlush(newUser);

      if (!newUser) {
        res.status(500).json({
          message: "Ocurrió un error al crear el usuario.",
        });
      }

      const payload = {
        id: newUser.id,
        mail: newUser.email,
        user_type: newUser.user_type,
      };

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({
          message: "Internal server error. (JWT no configurado).",
        });
      }

      const token = jwt.sign(
        payload,
        secret as any,
        { expiresIn: process.env.EXPIRA_TOKEN || "7d" } as any
      );

      const response: LoginResponse = {
        token: token,
        user: {
          id: Number(newUser.id),
          username: newUser.username,
          user_type: newUser.user_type,
        },
      };

      res.status(201).json(response);
    } catch (error) {} //falta hacer el catch errro!!!!!!!!!!!!!!!!!!!!!!
  }

  async checkToken(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(200).json({ message: "Token válido", user: req.user });
    } catch (error) {
      7;
      console.error(`checkToken error: ${error}`);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}

export { AuthController };
