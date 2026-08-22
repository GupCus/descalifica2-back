import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeCategoriaInput, update, uploadLogoImage, deleteLogoImage } from "./categoria.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/', ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, add)
categoriaRouter.patch('/:id', ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, update)
categoriaRouter.put('/:id', ...uploadImageOptional("categorias", "logos"), sanitizeCategoriaInput, update)

categoriaRouter.patch('/:id/logo-image', ...uploadImage("categorias", "logos"), uploadLogoImage)
categoriaRouter.delete('/:id/logo-image', deleteLogoImage)

categoriaRouter.delete('/:id', remove)