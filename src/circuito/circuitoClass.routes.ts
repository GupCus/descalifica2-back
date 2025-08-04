import { Router } from "express";
import { findAll, findOne, add, update, remove } from './circuitoClass.controller.js';

export const circuitoClassRouter = Router();

circuitoClassRouter.get('/', findAll);
circuitoClassRouter.get('/:id', findOne);
circuitoClassRouter.post('/', add);
circuitoClassRouter.put('/:id', update);
circuitoClassRouter.delete('/:id', remove);