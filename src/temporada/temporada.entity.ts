import { baseEntity } from '../shared/baseEntity.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Rel,
  Collection,
  OneToMany,
  Cascade,
} from '@mikro-orm/core';
import { Carrera } from '../carrera/carrera.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';
import { Driver_Championship } from '../championship/driver_championship.entity.js';
import { Team_Championship } from '../championship/team_championship.entity.js';

@Entity()
export class Temporada {
  @PrimaryKey()
  id?: number;

  @Property({ nullable: false })
  year!: number;

  @OneToMany(() => Carrera, (carrera) => carrera.season)
  races = new Collection<Carrera>(this);

  @ManyToOne(() => Categoria)
  racing_series!: Rel<Categoria>;

  @ManyToOne(() => Piloto, { nullable: true, cascade: [Cascade.ALL] })
  winner_driver?: Rel<Piloto>;

  @ManyToOne(() => Escuderia, { nullable: true, cascade: [Cascade.ALL] })
  winner_team?: Rel<Escuderia>;

  @OneToMany(() => Driver_Championship, (dc) => dc.season, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  drivers_championship = new Collection<Driver_Championship>(this);

  @OneToMany(() => Team_Championship, (dc) => dc.season, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  team_championship = new Collection<Team_Championship>(this);
}
