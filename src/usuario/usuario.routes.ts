import { Router } from "express";
import {
  findAll,
  findOne,
  update,
  remove,
  sanitizeUsuario,
} from "./usuario.controller.js";

export const usuarioRouter = Router();

usuarioRouter.get("/", findAll);
usuarioRouter.get("/:id", findOne);
usuarioRouter.put("/:id", sanitizeUsuario, update);
usuarioRouter.patch("/:id", sanitizeUsuario, update);
usuarioRouter.delete("/:id", remove);
