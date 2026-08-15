/**
 * Entidad que representa la información detallada de un piloto participante en una sesión
 * (nombre, equipo, color del equipo, número de piloto, nacionalidad, etc.).
 */
export class Drivers {
  meeting_key?: number;
  session_key?: number;
  driver_number?: number;
  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
  team_name?: string;
  team_colour?: string;
  first_name?: string;
  last_name?: string;
  headshot_url?: string;
  country_code?: string;
}
