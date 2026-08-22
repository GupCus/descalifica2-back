import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeComentario,
} from './comentario.controller.js';

export const comentarioRouter = Router();

comentarioRouter.get('/', findAll);
comentarioRouter.get('/:id', findOne);
comentarioRouter.post('/', sanitizeComentario, add);
comentarioRouter.put('/:id', sanitizeComentario, update);
comentarioRouter.patch('/:id', sanitizeComentario, update);
comentarioRouter.delete('/:id', remove);
