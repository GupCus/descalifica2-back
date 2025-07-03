import { Router } from "express";
import { sanitizePilotoInput, findAll, findOne, add, update, remove } from "./piloto.controler.js";

export const pilotoRouter = Router()

pilotoRouter.get('/', findAll)
pilotoRouter.get('/:id', findOne)
pilotoRouter.post('/',sanitizePilotoInput, add)
pilotoRouter.patch('/:id',sanitizePilotoInput,update)
pilotoRouter.put('/:id',sanitizePilotoInput,update)
pilotoRouter.delete('/:id', remove)
