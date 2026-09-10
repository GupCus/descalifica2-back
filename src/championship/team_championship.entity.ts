import { Entity, Property, ManyToOne, Rel, PrimaryKey } from '@mikro-orm/core';
import { Temporada } from '../temporada/temporada.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';

@Entity()
export class Team_Championship {
  @PrimaryKey()
  id?: number;
  @Property({ nullable: false })
  points!: number;
  @Property({ nullable: false })
  position!: number;
  @ManyToOne(() => Escuderia, { nullable: true })
  escuderia?: Rel<Escuderia>;
  @ManyToOne(() => Temporada, { nullable: false })
  season!: Rel<Temporada>;
}
