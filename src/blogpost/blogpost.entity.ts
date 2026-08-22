import {
  Entity,
  Property,
  ManyToOne,
  Rel,
  Cascade,
  OneToMany,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { ComentarioPost } from '../comentariopost/comentario.entity.js';

@Entity()
export class Blogpost extends baseEntity {
  @Property({ nullable: false })
  title!: string;

  @Property({ nullable: false })
  content!: string;

  @ManyToOne(() => Usuario, { cascade: [Cascade.ALL], nullable: false })
  author!: Rel<Usuario>;

  @OneToMany(() => ComentarioPost, (comentario) => comentario.blogpost, {
    cascade: [Cascade.ALL],
  })
  comentarios!: Rel<ComentarioPost[]>;
}
