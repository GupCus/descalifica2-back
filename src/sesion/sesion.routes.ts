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
sesionRouter.post('/', sanitizeSesionInput, add);
sesionRouter.put('/:id', sanitizeSesionInput, update);
sesionRouter.patch('/:id', sanitizeSesionInput, update);
sesionRouter.delete('/:id', remove);
