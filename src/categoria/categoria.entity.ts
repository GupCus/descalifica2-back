import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Cascade,
} from "@mikro-orm/core";
import { Escuderia } from "../escuderia/escuderia.entity.js";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Temporada } from "../temporada/temporada.entity.js";
import { Piloto } from "../piloto/piloto.entity.js";

@Entity()
export class Categoria extends baseEntity {
  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => Piloto, (piloto) => piloto.racing_series, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  drivers = new Collection<Piloto>(this);

  @OneToMany(() => Escuderia, (escuderia) => escuderia.racing_series)
  teams = new Collection<Escuderia>(this);

  @OneToMany(() => Temporada, (temporada) => temporada.racing_series, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  seasons = new Collection<Temporada>(this);
}
