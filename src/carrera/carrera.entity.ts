import {
  Entity,
  ManyToOne,
  Property,
  Rel,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Circuito } from '../circuito/circuito.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';
import { Sesion } from '../sesion/sesion.entity.js';

@Entity()
export class Carrera extends baseEntity {
  @Property({ nullable: false })
  start_date!: Date;

  @Property({ nullable: false })
  end_date!: Date;

  @ManyToOne(() => Circuito, { nullable: false })
  Circuito!: Rel<Circuito>;

  @ManyToOne(() => Temporada, { nullable: false })
  temporada!: Rel<Temporada>;

  // coleccion de sesiones
  @OneToMany(() => Sesion, (sesion) => sesion.carrera)
  sesiones = new Collection<Sesion>(this);
}
