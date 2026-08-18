/**
 * Entidad que representa la telemetría del monoplaza (velocidad, revoluciones, marchas, frenos, DRS, etc.)
 * en un instante específico de tiempo durante la sesión.
 */
export class CarData {
  meeting_key!: number;
  session_key!: number;
  driver_number!: number;
  date!: Date | string;
  rpm!: number;
  speed!: number;
  n_gear!: number;
  throttle!: number;
  brake!: number;
  drs!: number;
}
