import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeTemporadaInput } from "./temporada.controller.js";

export const temporadaRouter = Router()

temporadaRouter.get('/', findAll)
temporadaRouter.get('/:id', findOne)
temporadaRouter.post('/', authenticateAdmin,sanitizeTemporadaInput, add)
temporadaRouter.patch('/:id', authenticateAdmin, sanitizeTemporadaInput, update)
temporadaRouter.put('/:id', authenticateAdmin,sanitizeTemporadaInput,update)
temporadaRouter.delete('/:id', authenticateAdmin, remove)