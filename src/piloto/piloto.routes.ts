import { Router } from "express";
import { sanitizePilotoInput, findAll,findOne, add, update, remove } from "./piloto.controller.js";

export const pilotoRouter = Router()

pilotoRouter.get('/',findAll)
pilotoRouter.get('/:id',findOne)
pilotoRouter.post('/',sanitizePilotoInput,add)
pilotoRouter.put('/:id',sanitizePilotoInput,update)
pilotoRouter.patch('/:id',sanitizePilotoInput,update)
pilotoRouter.delete('/:id',sanitizePilotoInput,remove)