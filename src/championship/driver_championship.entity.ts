import { Entity, Property, ManyToOne, Rel, PrimaryKey } from '@mikro-orm/core';

import { Piloto } from '../piloto/piloto.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';

@Entity()
export class Driver_Championship {
  @PrimaryKey()
  id?: number;
  @Property({ nullable: false })
  points!: number;
  @Property({ nullable: false })
  position!: number;
  @ManyToOne(() => Piloto, { nullable: true })
  piloto?: Rel<Piloto>;
  @ManyToOne(() => Temporada, { nullable: false })
  season!: Rel<Temporada>;
}
