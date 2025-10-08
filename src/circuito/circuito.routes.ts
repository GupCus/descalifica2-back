import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeCircuitoInput,
} from './circuito.controller.js';

export const circuitoRouter = Router();

circuitoRouter.get('/', findAll);
circuitoRouter.get('/:id', findOne);
circuitoRouter.post('/', sanitizeCircuitoInput, add);
circuitoRouter.put('/:id', sanitizeCircuitoInput, update);
circuitoRouter.patch('/:id', sanitizeCircuitoInput, update);
circuitoRouter.delete('/:id', remove);
