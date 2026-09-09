import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  remove,
  sanitizeComentario,
  countsByBlogpost,
} from './comentario.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

export const comentarioRouter = Router();

comentarioRouter.get('/', findAll);
comentarioRouter.get('/counts', countsByBlogpost);
comentarioRouter.get('/:id', findOne);
comentarioRouter.post('/', authenticateToken, sanitizeComentario, add);
comentarioRouter.delete('/:id', authenticateToken, remove);
