import { Router } from 'express';
import {
  findAll,
  findOne,
  update,
  remove,
  sanitizeUsuario,
  uploadAvatar,
  deleteAvatar,
  findPublic,
  adminResetPassword,
} from './usuario.controller.js';
import {
  uploadImage,
  uploadImageOptional,
} from '../shared/upload/upload.middleware.js';
import {
  authenticateToken,
  authenticateAdmin,
  authorizeSelfOrAdmin,
} from '../auth/auth.middleware.js';

export const usuarioRouter = Router();

usuarioRouter.get('/', authenticateAdmin, findAll);
usuarioRouter.get('/public', findPublic);
usuarioRouter.get('/:id', authorizeSelfOrAdmin, findOne);
usuarioRouter.put(
  '/:id',
  ...uploadImageOptional('usuarios', 'avatars'),
  authorizeSelfOrAdmin,
  sanitizeUsuario,
  update,
);
usuarioRouter.patch(
  '/:id',
  ...uploadImageOptional('usuarios', 'avatars'),
  authorizeSelfOrAdmin,
  sanitizeUsuario,
  update,
);

// Reseteo administrativo de contraseña (operación distinta, auditada y con cambio forzado)
usuarioRouter.post(
  '/:id/admin-reset-password',
  authenticateAdmin,
  (req, res) => adminResetPassword(req as any, res),
);

// Upload dedicado de avatar
usuarioRouter.patch(
  '/:id/avatar',
  ...uploadImage('usuarios', 'avatars'),
  authorizeSelfOrAdmin,
  uploadAvatar,
);
usuarioRouter.delete('/:id/avatar', authorizeSelfOrAdmin, deleteAvatar);

usuarioRouter.delete('/:id', authenticateAdmin, remove);
