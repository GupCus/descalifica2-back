/**
 * Entidad que representa el resultado final de un piloto al concluir una sesión particular.
 * Incluye su posición final, número de vueltas dadas y si terminó la carrera (DNF/DSQ).
 */
export class SessionResult {
  position!: number;
  driver_number!: number;
  number_of_laps!: number;
  dnf!: boolean;
  dns!: boolean;
  dsq!: boolean;
  duration!: number;
  gap_to_leader!: number;
  meeting_key!: number;
  session_key!: number;
}
