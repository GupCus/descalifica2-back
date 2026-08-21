import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeEscuderia, uploadLogoImage, deleteLogoImage } from "./escuderia.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const escuderiaRouter = Router()

escuderiaRouter.get('/', findAll)
escuderiaRouter.get('/:id', findOne)
escuderiaRouter.post('/', ...uploadImageOptional("escuderias", "logos"), sanitizeEscuderia, add)
escuderiaRouter.put('/:id', ...uploadImageOptional("escuderias", "logos"), sanitizeEscuderia, update)
escuderiaRouter.patch('/:id', ...uploadImageOptional("escuderias", "logos"), sanitizeEscuderia, update)

// Upload dedicado de logo
escuderiaRouter.patch('/:id/logo-image', ...uploadImage("escuderias", "logos"), uploadLogoImage)
escuderiaRouter.delete('/:id/logo-image', deleteLogoImage)

escuderiaRouter.delete('/:id', remove)