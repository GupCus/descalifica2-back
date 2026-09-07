import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeCircuitoInput,
  uploadTrackMap,
  deleteTrackMap,
  uploadPhotoImage,
  deletePhotoImage,
} from "./circuito.controller.js";
import {
  uploadImage,
  uploadImageOptional,
} from "../shared/upload/upload.middleware.js";

export const circuitoRouter = Router();

circuitoRouter.get("/", findAll);
circuitoRouter.get("/:id", findOne);
circuitoRouter.post("/", authenticateAdmin,
  ...uploadImageOptional("circuitos", "track_maps"),
  sanitizeCircuitoInput,
  add,
);
circuitoRouter.put("/:id", authenticateAdmin,
  ...uploadImageOptional("circuitos", "track_maps"),
  sanitizeCircuitoInput,
  update,
);
circuitoRouter.patch("/:id", authenticateAdmin,
  ...uploadImageOptional("circuitos", "track_maps"),
  sanitizeCircuitoInput,
  update,
);

// Upload dedicado de mapa del trazado
circuitoRouter.patch("/:id/track-map", authenticateAdmin,
  ...uploadImage("circuitos", "track_maps"),
  uploadTrackMap,
);
circuitoRouter.delete("/:id/track-map", authenticateAdmin, deleteTrackMap);

// Upload dedicado de foto del circuito
circuitoRouter.patch("/:id/upload-image", authenticateAdmin,
  ...uploadImage("circuitos", "photos"),
  uploadPhotoImage,
);
circuitoRouter.delete("/:id/upload-image", authenticateAdmin, deletePhotoImage);

circuitoRouter.delete("/:id", authenticateAdmin, remove);
