import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeCarrera } from "./carrera.controller.js";

export const carreraRouter = Router()

carreraRouter.get('/', findAll)
carreraRouter.get('/:id', findOne)
carreraRouter.post('/', authenticateAdmin, sanitizeCarrera, add)
carreraRouter.put('/:id', authenticateAdmin, sanitizeCarrera, update)
carreraRouter.patch('/:id', authenticateAdmin, sanitizeCarrera, update)
carreraRouter.delete('/:id', authenticateAdmin, remove)
