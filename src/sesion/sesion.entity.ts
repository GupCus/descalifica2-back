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
  type?: string;

  @Property({ nullable: true })
  start_time?: Date;

  @Property({ nullable: true})
  end_time?: Date;

  // Relación con carrera DEBIL
  @ManyToOne(() => Carrera, { nullable: false })
  race!: Rel<Carrera>;

  @Property({ type: "json", nullable: true })
  results?: [string, string][];
}
