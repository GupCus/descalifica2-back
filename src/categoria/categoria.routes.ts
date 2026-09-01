import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeCategoriaInput, update, uploadLogoImage, deleteLogoImage } from "./categoria.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/', authenticateAdmin, ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, add)
categoriaRouter.patch('/:id', authenticateAdmin, ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, update)
categoriaRouter.put('/:id', authenticateAdmin, ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, update)

categoriaRouter.patch('/:id/logo-image', authenticateAdmin, ...uploadImage("categorias", "logos"), uploadLogoImage)
categoriaRouter.delete('/:id/logo-image', authenticateAdmin, deleteLogoImage)

categoriaRouter.delete('/:id', authenticateAdmin, remove)