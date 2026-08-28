import { Entity, Property, ManyToOne, Rel, Cascade, PrimaryKey } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Blogpost } from '../blogpost/blogpost.entity.js';

@Entity()
export class ComentarioPost {
  @PrimaryKey()
  id?: number;
  @Property({ nullable: false })
  content!: string;
  @Property({ nullable: false })
  createdAt: Date = new Date();

  @ManyToOne(() => Usuario, { nullable: false })
  author!: Rel<Usuario>;

  @ManyToOne(() => Blogpost, { nullable: false })
  blogpost!: Rel<Blogpost>;
}
