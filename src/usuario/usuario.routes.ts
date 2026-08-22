import { Router } from "express";
import {
  findAll,
  findOne,
  update,
  remove,
  sanitizeUsuario,
  uploadAvatar,
  deleteAvatar,
} from "./usuario.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const usuarioRouter = Router();

usuarioRouter.get("/", findAll);
usuarioRouter.get("/:id", findOne);
usuarioRouter.put("/:id", ...uploadImageOptional("usuarios", "avatars"), sanitizeUsuario, update);
usuarioRouter.patch("/:id", ...uploadImageOptional("usuarios", "avatars"), sanitizeUsuario, update);

// Upload dedicado de avatar
usuarioRouter.patch("/:id/avatar", ...uploadImage("usuarios", "avatars"), uploadAvatar);
usuarioRouter.delete("/:id/avatar", deleteAvatar);

usuarioRouter.delete("/:id", remove);
