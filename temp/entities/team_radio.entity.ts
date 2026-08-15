/**
 * Entidad que representa las comunicaciones por radio (mensajes de audio)
 * entre el piloto y los ingenieros en el muro del equipo.
 */
export class TeamRadio {
  meeting_key?: number;
  session_key?: number;
  driver_number?: number;
  date?: Date | string;
  recording_url?: string;
}
