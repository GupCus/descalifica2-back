/**
 * Entidad que representa una sesión específica dentro de un Gran Premio.
 * Puede ser una sesión de Entrenamientos Libres (Practice), Clasificación (Qualifying), Sprint o Carrera (Race).
 */
export class Sessions {
  session_key!: number;
  session_type!: string;
  session_name!: string;
  date_start!: Date | string;
  date_end!: Date | string;
  meeting_key!: number;
  circuit_key!: number;
  circuit_short_name!: string;
  country_key!: number;
  country_code!: string;
  country_name!: string;
  location!: string;
  gmt_offset!: string;
  year!: number;
  is_cancelled!: boolean;
}
