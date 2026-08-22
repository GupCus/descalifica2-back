// Endpoint Service

import { Router } from 'express';
import {
  openf1actualizarcampeones,
  openf1restablecer,
} from './openf1.controller.js';

export const of1router = Router();
of1router.post('/actualizarcampeones', openf1actualizarcampeones);
of1router.post('/restablecer', openf1restablecer);
