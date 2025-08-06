import {
  Entity,
  Property,
  ManyToMany,
  Collection,
  Cascade,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';
import { Circuito } from '../circuito/circuito.entity.js';

@Entity()
export class Sesion extends baseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: true })
  tipoSesion?: string;

  @Property({ nullable: false, unique: true })
  fecha_Hora_sesion!: Date;

  // Relación con circuito
  @ManyToOne(() => Circuito, { nullable: true })
  circuito?: Rel<Circuito>;

  // Array de pilotos ordenados según la grilla de largada
  @ManyToMany(() => Piloto, undefined, { cascade: [Cascade.ALL] })
  grilla = new Collection<Piloto>(this);

  // Array de pilotos ordenados según resultados finales
  @ManyToMany(() => Piloto, undefined, { cascade: [Cascade.ALL] })
  resultados = new Collection<Piloto>(this);
}
