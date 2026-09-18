import { Router } from 'express';
import {
  generarcodigo,
  verificarVinculacion,
  desvincularTelegram,
  generarcodigoRegistro,
  verificarRegistro,
} from './telegram.controller.js';
import { authenticateToken } from '../../auth/auth.middleware.js';
import { authenticateAdmin } from '../../auth/auth.middleware.js';
import {
  enviarTopPostSemanal,
  verificarSesionesProximas,
} from './telegram.service.js';

export const telegramrouter = Router();
telegramrouter.post('/generarcodigo', authenticateToken, generarcodigo);
telegramrouter.get('/verificar', authenticateToken, verificarVinculacion);
telegramrouter.delete('/desvincular', authenticateToken, desvincularTelegram);
telegramrouter.post('/generarcodigo-registro', generarcodigoRegistro);
telegramrouter.get('/verificar-registro/:codigo', verificarRegistro);

// Endpoint de test para disparar manualmente el envío del top post semanal (solo admin)
telegramrouter.post(
  '/test-top-semanal',
  authenticateAdmin,
  async (_req, res) => {
    try {
      await enviarTopPostSemanal();
      res
        .status(200)
        .json({ message: 'Envío del top post semanal ejecutado.' });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error al enviar', error: error.message });
    }
  },
);

telegramrouter.post(
  '/test-proximas-sesiones',
  authenticateAdmin,
  async (_req, res) => {
    try {
      await verificarSesionesProximas();
      res
        .status(200)
        .json({ message: 'Verificación de próximas sesiones ejecutada.' });
    } catch (error: any) {
      res
        .status(500)
        .json({
          message: 'Error al verificar próximas sesiones',
          error: error.message,
        });
    }
  },
);
