/**
 * Entidad que representa la ubicación geoespacial exacta (coordenadas x, y, z)
 * de un piloto en el circuito en un momento preciso.
 */
export class Location {
  meeting_key!: number;
  session_key!: number;
  driver_number!: number;
  date!: Date | string;
  x!: number;
  y!: number;
  z!: number;
}
