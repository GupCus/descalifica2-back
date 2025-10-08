import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeMarca } from "./marca.controller.js";

export const marcaRouter = Router()

marcaRouter.get('/', findAll);
marcaRouter.get('/:id', findOne);
marcaRouter.post('/', sanitizeMarca, add);
marcaRouter.put('/:id', sanitizeMarca, update);
marcaRouter.patch('/:id', sanitizeMarca, update);
marcaRouter.delete('/:id', remove);
