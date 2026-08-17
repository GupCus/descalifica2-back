/**
 * Entidad que representa los intervalos de tiempo y distancia entre los pilotos durante una sesión,
 * indicando la diferencia con el líder y el piloto de adelante.
 */
export class Intervals {
  meeting_key!: number;
  session_key!: number;
  driver_number!: number;
  date!: Date | string;
  gap_to_leader!: number;
  interval!: number;
}
