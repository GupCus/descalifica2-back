import { Router } from "express";
import { sanitizeEscuderiaInput, findAll,findOne, add, update, remove } from "./escuderia.controller.js";

export const escuderiaRouter = Router()

escuderiaRouter.get('/',findAll)
escuderiaRouter.get('/:id',findOne)
escuderiaRouter.post('/',sanitizeEscuderiaInput,add)
escuderiaRouter.put('/:id',sanitizeEscuderiaInput,update)
escuderiaRouter.patch('/:id',sanitizeEscuderiaInput,update)
escuderiaRouter.delete('/:id',sanitizeEscuderiaInput,remove)