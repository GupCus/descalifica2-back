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
  tipoSesion?: string; //ELEGIR UPPERCASE O GUIONES BAJOS PARA SEPARAR LAS PALABRAS!!!!!

  @Property({ nullable: false, unique: true })
  fecha_Hora_sesion!: Date;

  // Relación con carrera
  @ManyToOne(() => Carrera, { nullable: true })
  carrera?: Rel<Carrera>;

  // Array de pilotos ordenados según resultados finales
  @ManyToMany(() => Piloto, undefined, { cascade: [Cascade.ALL] })
  resultados = new Collection<Piloto>(this);
}
