/**
 * Entidad que representa los mensajes y notificaciones emitidos por Dirección de Carrera.
 * Incluye banderas amarillas/rojas, safety car, penalizaciones y avisos de pista.
 */
export class RaceControl {
  meeting_key?: number;
  session_key?: number;
  date?: Date | string;
  driver_number?: any;
  lap_number?: any;
  category?: string;
  flag?: string;
  scope?: string;
  sector?: any;
  qualifying_phase?: any;
  message?: string;
}
