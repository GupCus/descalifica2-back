/**
 * Entidad que representa la posición exacta en la clasificación o en pista de un piloto
 * en un instante de tiempo determinado.
 */
export class Position {
  date!: Date | string;
  session_key!: number;
  meeting_key!: number;
  driver_number!: number;
  position!: number;
}
