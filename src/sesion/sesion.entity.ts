import {
  Entity,
  Property,
  ManyToMany,
  Collection,
  Cascade,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Piloto } from "../piloto/piloto.entity.js";
import { Carrera } from "../carrera/carrera.entity.js";

@Entity()
export class Sesion extends baseEntity {
  @Property({ nullable: true })
  type?: string; //ELEGIR UPPERCASE O GUIONES BAJOS PARA SEPARAR LAS PALABRAS!!!!!, GUIONES MEJOR

  @Property({ nullable: false, unique: true })
  start_time!: Date;

  @Property({ nullable: false, unique: true })
  end_time?: Date;

  // Relación con carrera DEBIL
  @ManyToOne(() => Carrera, { nullable: false })
  race!: Rel<Carrera>;

  // Array de pilotos ordenados según resultados finales
  @ManyToMany(() => Piloto, undefined, { cascade: [Cascade.ALL] })
  results = new Collection<Piloto>(this);
}
