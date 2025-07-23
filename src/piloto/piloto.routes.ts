import { Router } from "express";
import { findAll,findOne, add, update, remove } from "./piloto.controller.js";

export const pilotoRouter = Router()

pilotoRouter.get('/',findAll)
pilotoRouter.get('/:id',findOne)
pilotoRouter.post('/',add)
pilotoRouter.put('/:id',update)
pilotoRouter.delete('/:id',remove)