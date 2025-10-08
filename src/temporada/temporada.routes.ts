import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeTemporadaInput } from "./temporada.controller.js";

export const temporadaRouter = Router()

temporadaRouter.get('/', findAll)
temporadaRouter.get('/:id', findOne)
temporadaRouter.post('/',sanitizeTemporadaInput, add)
temporadaRouter.patch('/:id', sanitizeTemporadaInput, update)
temporadaRouter.put('/:id',sanitizeTemporadaInput,update)
temporadaRouter.delete('/:id', remove)