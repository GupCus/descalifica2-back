import cron from 'node-cron';
import {
  enviarTopPostSemanal,
  verificarSesionesProximas,
} from '../telegram/telegram.service.js';

export function iniciarCronJobs() {
  // Todos los viernes a las 17:00 (5 PM, hora del servidor)
  cron.schedule('0 17 * * 5', async () => {
    console.log('[CRON] Ejecutando envío del top post semanal...');
    try {
      await enviarTopPostSemanal();
    } catch (error) {
      console.error('[CRON] Error al enviar top post semanal:', error);
    }
  });

  cron.schedule('*/5 * * * *', async () => {
    try {
      await verificarSesionesProximas();
    } catch (error) {
      console.error('[CRON] Error al verificar próximas sesiones:', error);
    }
  });
}
