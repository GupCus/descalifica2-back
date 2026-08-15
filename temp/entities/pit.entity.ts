/**
 * Entidad que representa la información de las paradas en boxes (pit stops) realizadas por un piloto,
 * detallando la duración de la parada y el tiempo en el pit lane.
 */
export class Pit {
  date?: Date | string;
  session_key?: number;
  driver_number?: number;
  meeting_key?: number;
  lap_number?: number;
  pit_duration?: any;
  lane_duration?: any;
  stop_duration?: any;
}
