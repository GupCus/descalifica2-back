import { Router } from "express";
import { upload } from "../shared/middlewares/multer.config.js";
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
usuarioRouter.put("/:id", upload.single("avatar"), sanitizeUsuario, update);
usuarioRouter.patch("/:id", sanitizeUsuario, update);
usuarioRouter.delete("/:id", remove);
