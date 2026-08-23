// Endpoint Service

import { Router } from 'express';
import { openf1actualizarresultadoscarrera } from './openf1.controller.js';

export const of1router = Router();
of1router.post('/actualizarresultados/:id', openf1actualizarresultadoscarrera);
