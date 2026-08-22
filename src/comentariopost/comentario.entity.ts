import { Entity, Property, ManyToOne, Rel, Cascade } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Blogpost } from '../blogpost/blogpost.entity.js';

@Entity()
export class ComentarioPost extends baseEntity {
  @Property({ nullable: false })
  content!: string;
  @Property({ nullable: false })
  createdAt: Date = new Date();

  @ManyToOne(() => Usuario, { nullable: false })
  author!: Rel<Usuario>;

  @ManyToOne(() => Blogpost, { nullable: false })
  blogpost!: Rel<Blogpost>;
}
