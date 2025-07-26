import { Router } from "express";
import { findAll,findOne, add, update, remove, sanitizeEscuderia } from "./escuderia.controller.js";

export const escuderiaRouter = Router()

escuderiaRouter.get('/',findAll)
escuderiaRouter.get('/:id',findOne)
escuderiaRouter.post('/',sanitizeEscuderia,add)
escuderiaRouter.put('/:id',sanitizeEscuderia,update)
escuderiaRouter.patch('/:id',sanitizeEscuderia,update)
escuderiaRouter.delete('/:id',remove)