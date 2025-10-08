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
} from "@mikro-orm/core";
import { Carrera } from "../carrera/carrera.entity.js";

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

  @Property({ nullable: true }) //Capaz haya que cambiar esto para que nos traiga la info necesaria de piloto y escudería ganadora.
  winner_driver?: string;

  @Property({ nullable: true })
  winner_team?: string;
}
