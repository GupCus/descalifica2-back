/**
 * Entidad que representa la información de una vuelta completada por un piloto.
 * Incluye tiempos de los 3 sectores, duración total de la vuelta, y velocidades punta.
 */
export class Laps {
  meeting_key!: number;
  session_key!: number;
  driver_number!: number;
  lap_number!: number;
  date_start!: any;
  duration_sector_1!: any;
  duration_sector_2!: number;
  duration_sector_3!: number;
  i1_speed!: number;
  i2_speed!: number;
  is_pit_out_lap!: boolean;
  lap_duration!: any;
  segments_sector_1!: number[];
  segments_sector_2!: number[];
  segments_sector_3!: number[];
  st_speed!: number;
}
