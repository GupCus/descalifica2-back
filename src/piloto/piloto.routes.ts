import { Router } from "express";
import { findAll,findOne, add, update, remove , sanitizePiloto } from "./piloto.controller.js";

export const pilotoRouter = Router()

pilotoRouter.get('/',findAll)
pilotoRouter.get('/:id',findOne)
pilotoRouter.post('/',sanitizePiloto,add)
pilotoRouter.put('/:id',sanitizePiloto,update)
pilotoRouter.patch('/:id',sanitizePiloto,update)
pilotoRouter.delete('/:id',remove)
