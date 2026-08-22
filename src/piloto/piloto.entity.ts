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

  @Property({ nullable: true })
  num?: number;

  @Property({ nullable: true })
  nationality?: string;

  @Property({ nullable: true })
  birth_date?: Date;

  @ManyToOne(() => Categoria, { cascade: [Cascade.ALL], nullable: true })
  racing_series?: Categoria;

  @Property({ nullable: true })
  profile_image?: string;

  @ManyToOne(() => Temporada, { cascade: [Cascade.ALL], nullable: true })
  season?: Temporada;

  // CANDIDATO A ELIMINAR
  @Property({ nullable: true })
  role?: string;

  /* ELIMINADO 
  @OneToMany(() => Temporada, (temporada) => temporada.winner_driver)
  wdcs = new Collection<Temporada>(this);
  */
}
