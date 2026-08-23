/**
 * Entidad que representa las condiciones meteorológicas en el circuito en un momento dado.
 * Incluye temperatura del aire y pista, humedad, presión, velocidad del viento y nivel de lluvia.
 */
export class Weather {
  date!: Date | string;
  session_key!: number;
  humidity!: number;
  pressure!: number;
  rainfall!: number;
  track_temperature!: number;
  wind_speed!: number;
  meeting_key!: number;
  wind_direction!: number;
  air_temperature!: number;
}
