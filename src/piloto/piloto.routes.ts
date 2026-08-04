import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizePiloto, uploadProfileImage, deleteProfileImage } from "./piloto.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const pilotoRouter = Router()

pilotoRouter.get('/', findAll)
pilotoRouter.get('/:id', findOne)
pilotoRouter.post('/', ...uploadImageOptional("pilotos", "profile"), sanitizePiloto, add)
pilotoRouter.put('/:id', ...uploadImageOptional("pilotos", "profile"), sanitizePiloto, update)
pilotoRouter.patch('/:id', ...uploadImageOptional("pilotos", "profile"), sanitizePiloto, update)

// Upload dedicado de imagen de perfil
pilotoRouter.patch('/:id/profile-image', ...uploadImage("pilotos", "profile"), uploadProfileImage)
pilotoRouter.delete('/:id/profile-image', deleteProfileImage)

pilotoRouter.delete('/:id', remove)
