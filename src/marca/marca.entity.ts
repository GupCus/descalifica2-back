import {
  Entity,
  Property,
  OneToMany,
  Collection,
  Cascade,
} from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Escuderia } from "../escuderia/escuderia.entity.js";

@Entity()
export class Marca extends baseEntity {
  @Property({ nullable: false })
  nationality!: string;

  @Property({ nullable: false })
  foundation!: number;

  @OneToMany(() => Escuderia, (escuderia) => escuderia.brand, {
    cascade: [Cascade.ALL],
  })
  teams = new Collection<Escuderia>(this);
}
