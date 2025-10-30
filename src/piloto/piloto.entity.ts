import {
  Cascade,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Rel,
  Collection,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';

@Entity()
export class Piloto extends baseEntity {
  @ManyToOne(() => Escuderia, { nullable: false })
  //team!: Escuderia; DA ERROR, por ser una relacion circular. Se usa lo siguiente:
  team!: Rel<Escuderia>;

  @Property({ nullable: false, unique: false })
  num!: number;

  @Property({ nullable: false })
  nationality!: string;

  @Property({ nullable: true })
  birth_date?: Date;

  @Property({ nullable: false })
  role!: string;

  @ManyToOne(() => Categoria, { cascade: [Cascade.ALL], nullable: true })
  racing_series?: Rel<Categoria>;

  @OneToMany(() => Temporada, (temporada) => temporada.winner_driver)
  wdcs = new Collection<Temporada>(this);
}
//FRAN: hay q pasarlas a español
//AGUS: me gustan mas en inglés estas cosas
