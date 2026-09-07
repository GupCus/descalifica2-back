import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeSesionInput,
} from './sesion.controller.js';

export const sesionRouter = Router();

sesionRouter.get('/', findAll);
sesionRouter.get('/:id', findOne);
sesionRouter.post('/', authenticateAdmin, sanitizeSesionInput, add);
sesionRouter.put('/:id', authenticateAdmin, sanitizeSesionInput, update);
sesionRouter.patch('/:id', authenticateAdmin, sanitizeSesionInput, update);
sesionRouter.delete('/:id', authenticateAdmin, remove);
