import { Router } from 'express';
import {
  authenticateTokenAllowPasswordChange,
  requireRecentAuth,
  sanitizeLogin,
  sanitizeRegister,
} from './auth.middleware.js';
import { upload } from '../shared/middlewares/multer.config.js';
import { setUploadPath } from '../shared/upload/upload.middleware.js';
import { loginGoogle } from '../services/OAuth/oauth.service.js';
import {
  changePassword,
  checkToken,
  forgotPassword,
  login,
  reauthenticate,
  register,
  resetPassword,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', sanitizeLogin, login);
authRouter.post(
  '/register',
  setUploadPath('avatars'),
  upload.single('avatar'),
  sanitizeRegister,
  register,
);
authRouter.get(
  '/check-token',
  authenticateTokenAllowPasswordChange,
  (req, res) => checkToken(req as any, res),
);
authRouter.post('/login/google', loginGoogle, sanitizeLogin, login);
authRouter.post(
  '/reauthenticate',
  authenticateTokenAllowPasswordChange,
  (req, res) => reauthenticate(req as any, res),
);
authRouter.post(
  '/change-password',
  authenticateTokenAllowPasswordChange,
  requireRecentAuth,
  (req, res) => changePassword(req as any, res),
);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
