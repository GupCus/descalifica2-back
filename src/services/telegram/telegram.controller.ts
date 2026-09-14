import { Response } from "express";
import { orm } from "../../shared/db/orm.js";
import { Usuario } from "../../usuario/usuario.entity.js";
import { AuthenticatedRequest } from "../../auth/auth.types.js";

export const generarcodigo = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    } else if (usuario.telegram_id) {
      if (usuario.telegram_id.includes("otp")) {
        return res.status(200).json({
          message: "El usuario ya estaba pendiente de validación",
          codigo: usuario.telegram_id,
        });
      } else {
        return res.status(409).json({
          message: "El usuario ya está validado",
        });
      }
    } else {
      const codigotemp =
        "otp" +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");

      usuario.telegram_id = codigotemp;
      await em.flush();

      return res.status(200).json({
        message: "Se ha generado el codigo correctamente.",
        codigo: codigotemp,
      });
    }
  } catch (error: any) {
    console.error("Hubo un error:", error);
    return res
      .status(500)
      .json({ message: "Error interno", error: error.message });
  }
};

export const verificarVinculacion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!usuario.telegram_id) {
      return res.status(200).json({ vinculado: false, pendiente: false });
    }

    if (usuario.telegram_id.includes("otp")) {
      return res.status(200).json({ vinculado: false, pendiente: true });
    }

    return res.status(200).json({
      vinculado: true,
      pendiente: false,
      telegram_username: usuario.telegram_username || null,
    });
  } catch (error: any) {
    console.error("Error verificando vinculación:", error);
    return res
      .status(500)
      .json({ message: "Error interno", error: error.message });
  }
};

export const desvincularTelegram = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: req.user.id });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.telegram_id = null as any;
    usuario.telegram_username = null as any;
    await em.flush();

    return res.status(200).json({
      message: "Cuenta de Telegram desvinculada correctamente.",
    });
  } catch (error: any) {
    console.error("Error desvinculando Telegram:", error);
    return res
      .status(500)
      .json({ message: "Error interno", error: error.message });
  }
};
