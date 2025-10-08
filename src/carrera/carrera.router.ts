import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeCarrera } from "./carrera.controller.js";

export const carreraRouter = Router()

carreraRouter.get('/', findAll)
carreraRouter.get('/:id', findOne)
carreraRouter.post('/', sanitizeCarrera, add)
carreraRouter.put('/:id', sanitizeCarrera, update)
carreraRouter.patch('/:id', sanitizeCarrera, update)
carreraRouter.delete('/:id', remove)
