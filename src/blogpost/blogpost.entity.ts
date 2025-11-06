import { Entity, Property, ManyToOne, Rel, Cascade } from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Blogpost extends baseEntity {
  @Property({ nullable: false })
  content!: string;

  @ManyToOne(() => Usuario, { cascade: [Cascade.ALL], nullable: false })
  author!: Rel<Usuario>;
}
