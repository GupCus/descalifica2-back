import { authenticateAdmin } from '../auth/auth.middleware.js';
import { Router } from 'express';
import {
  findAll,
  add,
  update,
  remove,
  sanitizeChampionshipInput,
} from './championship.controller.js';

export const championshipRouter = Router();

championshipRouter.get('/', sanitizeChampionshipInput, findAll);
championshipRouter.post('/', authenticateAdmin, sanitizeChampionshipInput, add);
championshipRouter.put(
  '/:id',
  authenticateAdmin,
  sanitizeChampionshipInput,
  update,
);
championshipRouter.patch(
  '/:id',
  authenticateAdmin,
  sanitizeChampionshipInput,
  update,
);
championshipRouter.delete(
  '/:id',
  authenticateAdmin,
  sanitizeChampionshipInput,
  remove,
);
