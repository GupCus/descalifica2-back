import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeEscuderia,
  uploadLogoImage,
  deleteLogoImage,
  uploadCarImage,
  deleteCarImage,
} from "./escuderia.controller.js";
import {
  uploadImage,
  uploadImageOptional,
} from "../shared/upload/upload.middleware.js";

export const escuderiaRouter = Router();

escuderiaRouter.get("/", findAll);
escuderiaRouter.get("/:id", findOne);
escuderiaRouter.post("/", authenticateAdmin,
  ...uploadImageOptional("escuderias", "logos"),
  sanitizeEscuderia,
  add,
);
escuderiaRouter.put("/:id", authenticateAdmin,
  ...uploadImageOptional("escuderias", "logos"),
  sanitizeEscuderia,
  update,
);
escuderiaRouter.patch("/:id", authenticateAdmin,
  ...uploadImageOptional("escuderias", "logos"),
  sanitizeEscuderia,
  update,
);

// Upload dedicado de logo
escuderiaRouter.patch("/:id/logo-image", authenticateAdmin,
  ...uploadImage("escuderias", "logos"),
  uploadLogoImage,
);
escuderiaRouter.delete("/:id/logo-image", authenticateAdmin, deleteLogoImage);

escuderiaRouter.patch("/:id/car-image", authenticateAdmin,
  ...uploadImage("escuderias", "autos"),
  uploadCarImage,
);
escuderiaRouter.delete("/:id/car-image", authenticateAdmin, deleteCarImage);

escuderiaRouter.delete("/:id", authenticateAdmin, remove);
