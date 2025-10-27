import { baseEntity } from "../shared/baseEntity.entity.js";
import { Categoria } from "../categoria/categoria.entity.js";
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Rel,
  Collection,
  OneToMany,
  Cascade,
} from "@mikro-orm/core";
import { Carrera } from "../carrera/carrera.entity.js";
import { Piloto } from "../piloto/piloto.entity.js";
import { Escuderia } from "../escuderia/escuderia.entity.js";

@Entity()
export class Temporada {
  @PrimaryKey()
  id?: number;

  @Property({ nullable: false })
  year!: number;

  @OneToMany(() => Carrera, (carrera) => carrera.season)
  races = new Collection<Carrera>(this);

  @ManyToOne(() => Categoria) //UTILIZO REL "Cannot access 'Categoria' before initialization" at ".../temporada.entity.js"
  racing_series!: Rel<Categoria>;

  @ManyToOne(() => Piloto, { nullable: true, cascade: [Cascade.ALL] })
  winner_driver?: Rel<Piloto>;

  @ManyToOne(() => Escuderia, { nullable: true, cascade: [Cascade.ALL] })
  winner_team?: Rel<Escuderia>;
}
