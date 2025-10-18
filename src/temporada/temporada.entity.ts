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

  @OneToMany(() => Carrera, (carrera) => carrera.temporada) //cambiar "season" al nombre que le pongan en la CRUD carrera
  races = new Collection<Carrera>(this);

  @ManyToOne(() => Categoria) //UTILIZO REL "Cannot access 'Categoria' before initialization" at ".../temporada.entity.js"
  racing_series!: Rel<Categoria>;

  @ManyToOne(() => Piloto, { nullable: true, cascade: [Cascade.ALL] }) //Capaz haya que cambiar esto para que nos traiga la info necesaria de piloto y escudería ganadora.
  winner_driver?: Rel<Escuderia>;

  @ManyToOne(() => Escuderia, { nullable: true, cascade: [Cascade.ALL] })
  winner_team?: Rel<Escuderia>;
}
