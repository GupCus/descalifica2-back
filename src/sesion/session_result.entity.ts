import { Entity, Property, ManyToOne, PrimaryKey, Rel } from '@mikro-orm/core';
import { Sesion } from './sesion.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';

/**
 * Entidad que representa el resultado final de un piloto al concluir una sesión particular.
 * Incluye su posición final, número de vueltas dadas y si terminó la carrera (DNF/DSQ).
 */
@Entity()
export class Session_Result {
  @PrimaryKey()
  id?: number;

  @ManyToOne(() => Sesion, { nullable: false })
  session!: Rel<Sesion>;

  @Property({ nullable: true })
  position?: number;

  @ManyToOne(() => Piloto, { nullable: true })
  piloto?: Rel<Piloto>;

  @Property({ nullable: true })
  number_of_laps?: number;

  @Property({ default: false })
  dnf!: boolean;

  @Property({ default: false })
  dns!: boolean;

  @Property({ default: false })
  dsq!: boolean;

  @Property({ nullable: true })
  duration?: string;

  @Property({ nullable: true })
  gap_to_leader?: string;
}
