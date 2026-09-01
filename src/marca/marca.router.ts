import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeMarca, uploadLogoImage, deleteLogoImage } from "./marca.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const marcaRouter = Router()

marcaRouter.get('/', findAll);
marcaRouter.get('/:id', findOne);
marcaRouter.post('/', authenticateAdmin, ...uploadImageOptional("marcas", "logos"), sanitizeMarca, add);
marcaRouter.put('/:id', authenticateAdmin, ...uploadImageOptional("marcas", "logos"), sanitizeMarca, update);
marcaRouter.patch('/:id', authenticateAdmin, ...uploadImageOptional("marcas", "logos"), sanitizeMarca, update);

marcaRouter.patch('/:id/logo-image', authenticateAdmin, ...uploadImage("marcas", "logos"), uploadLogoImage);
marcaRouter.delete('/:id/logo-image', authenticateAdmin, deleteLogoImage);

marcaRouter.delete('/:id', authenticateAdmin, remove);
