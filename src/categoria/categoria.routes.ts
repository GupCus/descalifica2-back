import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeCategoriaInput, update } from "./categoria.controller.js";

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/',sanitizeCategoriaInput, add)
categoriaRouter.patch('/:id', sanitizeCategoriaInput, update)
categoriaRouter.put('/:id',sanitizeCategoriaInput,update)
categoriaRouter.delete('/:id', remove)