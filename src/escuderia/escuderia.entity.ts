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
  @OneToMany(() => Piloto, (piloto) => piloto.escuderia, {
    cascade: [Cascade.ALL],
  })
  drivers = new Collection<Piloto>(this);

  @Property({ nullable: false })
  fundation!: number;

  @Property({ nullable: false })
  nationality!: string;

  @Property({ nullable: false })
  engine!: string;

  @ManyToOne(() => Marca, { nullable: false })
  brand!: Rel<Marca>;

  @ManyToOne(() => Categoria, { nullable: true })
  racing_series!: Rel<Categoria>;

  @OneToMany(() => Temporada, (temporada) => temporada.winner_team)
  wccs = new Collection<Temporada>(this);
}

//AGUS: ¿¿¿QUE HAY DE IMPORTANTE COMO PARA PONER???
