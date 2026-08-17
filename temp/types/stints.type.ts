/**
 * Entidad que representa un "stint" o tanda de vueltas consecutivas realizadas por un piloto
 * utilizando el mismo juego y compuesto de neumáticos.
 */
export class Stints {
  meeting_key!: number;
  session_key!: number;
  stint_number!: number;
  driver_number!: number;
  lap_start!: number;
  lap_end!: number;
  compound!: string;
  tyre_age_at_start!: number;
}
