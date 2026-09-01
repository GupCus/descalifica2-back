import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizePiloto,
  uploadProfileImage,
  deleteProfileImage,
} from "./piloto.controller.js";
import {
  uploadImage,
  uploadImageOptional,
} from "../shared/upload/upload.middleware.js";

export const pilotoRouter = Router();

pilotoRouter.get("/", findAll);
pilotoRouter.get("/:id", findOne);
pilotoRouter.post("/", authenticateAdmin,
  ...uploadImageOptional("pilotos", "profile"),
  sanitizePiloto,
  add,
);
pilotoRouter.put("/:id", authenticateAdmin,
  ...uploadImageOptional("pilotos", "profile"),
  sanitizePiloto,
  update,
);
pilotoRouter.patch("/:id", authenticateAdmin,
  ...uploadImageOptional("pilotos", "profile"),
  sanitizePiloto,
  update,
);

// Upload dedicado de imagen de perfil
pilotoRouter.patch("/:id/portrait-image", authenticateAdmin,
  ...uploadImage("pilotos", "profile"),
  uploadProfileImage,
);
pilotoRouter.delete("/:id/portrait-image", authenticateAdmin, deleteProfileImage);

pilotoRouter.delete("/:id", authenticateAdmin, remove);
