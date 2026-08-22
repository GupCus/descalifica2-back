import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeMarca, uploadLogoImage, deleteLogoImage } from "./marca.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const marcaRouter = Router()

marcaRouter.get('/', findAll);
marcaRouter.get('/:id', findOne);
marcaRouter.post('/', ...uploadImageOptional("marcas", "logos"), sanitizeMarca, add);
marcaRouter.put('/:id', ...uploadImageOptional("marcas", "logos"), sanitizeMarca, update);
marcaRouter.patch('/:id', ...uploadImageOptional("marcas", "logos"), sanitizeMarca, update);

marcaRouter.patch('/:id/logo-image', ...uploadImage("marcas", "logos"), uploadLogoImage);
marcaRouter.delete('/:id/logo-image', deleteLogoImage);

marcaRouter.delete('/:id', remove);
