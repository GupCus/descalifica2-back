/**
 * Entidad que representa un evento o "Gran Premio" de Fórmula 1.
 * Un Meeting (evento) agrupa múltiples sesiones a lo largo de un fin de semana.
 */
export class Meetings {
  meeting_key!: number;
  meeting_name!: string;
  meeting_official_name!: string;
  location!: string;
  country_key!: number;
  country_code!: string;
  country_name!: string;
  country_flag!: string;
  circuit_key!: number;
  circuit_short_name!: string;
  circuit_type!: string;
  circuit_info_url!: string;
  circuit_image!: string;
  gmt_offset!: string;
  date_start!: Date | string;
  date_end!: Date | string;
  year!: number;
  is_cancelled!: boolean;
}
