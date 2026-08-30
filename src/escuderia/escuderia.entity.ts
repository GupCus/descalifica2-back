import { Piloto } from "../piloto/piloto.entity.js";
import { baseEntity } from "../shared/baseEntity.entity.js";
import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { Marca } from "../marca/marca.entity.js";
import { Categoria } from "../categoria/categoria.entity.js";
import { Temporada } from "../temporada/temporada.entity.js";

@Entity()
export class Escuderia extends baseEntity {
  //id y name se heredan de la baseEntity
  @OneToMany(() => Piloto, (piloto) => piloto.team, {
    cascade: [Cascade.ALL],
  })
  drivers = new Collection<Piloto>(this);

  @Property({ nullable: true })
  fundation?: number;

  @Property({ nullable: true })
  nationality?: string;

  @Property({ nullable: true })
  logo_image?: string;

  @Property({ nullable: true })
  car_image?: string;

  @ManyToOne(() => Marca, { nullable: true })
  brand?: Rel<Marca>;

  @ManyToOne(() => Categoria, { nullable: true })
  racing_series!: Rel<Categoria>;

  @OneToMany(() => Temporada, (temporada) => temporada.winner_team)
  wccs = new Collection<Temporada>(this);

  @Property({ nullable: true })
  color?: string;

  @Property({ nullable: true })
  engine?: string;

  @Property({ nullable: true })
  desc?: string;
}
