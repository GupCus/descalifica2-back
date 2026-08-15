/**
 * Entidad que representa la posición oficial de salida de un piloto en la parrilla
 * al inicio de una carrera o sesión de sprint.
 */
export class StartingGrid {
  meeting_key?: number;
  session_key?: number;
  driver_number?: number;
  position?: number;
}
